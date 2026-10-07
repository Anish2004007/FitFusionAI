from datetime import date
import re

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from accounts.models import User
from profile_app.models import UserProfile

from .models import (
    DietPlan,
    DietDay,
    DietMeal,
)


# =========================================================
# GET LOGGED-IN USER
# =========================================================

def get_logged_in_user(request):

    user_id = request.session.get("user_id")

    if not user_id:
        return None

    try:

        return User.objects.get(
            user_id=user_id
        )

    except User.DoesNotExist:

        request.session.flush()
        return None


# =========================================================
# CALCULATE AGE
# =========================================================

def calculate_age(date_of_birth):

    today = date.today()

    age = (
        today.year
        - date_of_birth.year
    )

    if (
        today.month,
        today.day
    ) < (
        date_of_birth.month,
        date_of_birth.day
    ):

        age -= 1

    return age


# =========================================================
# CALCULATE CALORIE TARGET
# =========================================================

def calculate_calorie_target(profile):

    height_cm = float(
        profile.height
    )

    weight_kg = float(
        profile.weight
    )

    age = calculate_age(
        profile.date_of_birth
    )

    # -----------------------------------------------------
    # BMR
    # -----------------------------------------------------

    if profile.gender == "Male":

        bmr = (
            10 * weight_kg
            + 6.25 * height_cm
            - 5 * age
            + 5
        )

    elif profile.gender == "Female":

        bmr = (
            10 * weight_kg
            + 6.25 * height_cm
            - 5 * age
            - 161
        )

    else:

        bmr = (
            10 * weight_kg
            + 6.25 * height_cm
            - 5 * age
            - 78
        )

    # -----------------------------------------------------
    # ACTIVITY
    # -----------------------------------------------------

    activity_multipliers = {

        "Sedentary": 1.2,

        "Lightly Active": 1.375,

        "Moderately Active": 1.55,

        "Very Active": 1.725,

        "Athlete": 1.9,

    }

    activity_multiplier = (
        activity_multipliers.get(
            profile.activity_level,
            1.2
        )
    )

    # -----------------------------------------------------
    # TDEE
    # -----------------------------------------------------

    tdee = round(
        bmr * activity_multiplier
    )

    # -----------------------------------------------------
    # GOAL ADJUSTMENT
    # -----------------------------------------------------

    adjustment = 0

    if profile.fitness_goal == "Lose Weight":

        adjustment = -500

    elif profile.fitness_goal == "Gain Muscle":

        adjustment = 300

    elif profile.fitness_goal == "Maintain Weight":

        adjustment = 0

    elif profile.fitness_goal == "Improve Fitness":

        adjustment = 0

    calorie_target = (
        tdee + adjustment
    )

    # Prevent an extremely low target.

    calorie_target = max(
        calorie_target,
        1200
    )

    return calorie_target


# =========================================================
# FOOD CLASSIFICATION
# =========================================================
#
# Your Food model currently has broad categories such as
# Protein/Dairy/Fruit/etc. It does not have a dietary type
# field, so we identify restricted foods from their names.
#
# This keeps the existing database structure unchanged.
# =========================================================

MEAT_KEYWORDS = [

    "chicken",
    "mutton",
    "lamb",
    "goat",
    "beef",
    "pork",
    "bacon",
    "ham",
    "sausage",
    "salami",
    "pepperoni",
    "turkey",
    "duck",
]

SEAFOOD_KEYWORDS = [

    "fish",
    "salmon",
    "tuna",
    "sardine",
    "sardines",
    "anchovy",
    "anchovies",
    "prawn",
    "prawns",
    "shrimp",
    "crab",
    "lobster",
    "squid",
    "octopus",
    "mussel",
    "mussels",
    "clam",
    "clams",
    "seafood",
]

EGG_KEYWORDS = [

    "egg",
    "eggs",
    "egg white",
    "egg whites",
    "egg yolk",
    "egg yolks",
    "omelette",
    "omelet",
    "scrambled egg",
    "scrambled eggs",
    "boiled egg",
    "boiled eggs",
    "fried egg",
    "fried eggs",
    "poached egg",
    "poached eggs",
]

DAIRY_KEYWORDS = [

    "milk",
    "paneer",
    "cheese",
    "curd",
    "yogurt",
    "yoghurt",
    "butter",
    "ghee",
    "cream",
    "whey",
    "casein",
    "buttermilk",
    "kefir",
]


def contains_food_keyword(
    food_name,
    keywords
):

    """
    Check whether a food name contains one of the
    restricted food keywords.

    Word-boundary matching prevents false matches such
    as 'eggplant' being treated as an egg.
    """

    name = (
        str(food_name)
        .strip()
        .lower()
    )

    for keyword in keywords:

        pattern = (
            r"\b"
            + re.escape(keyword.lower())
            + r"\b"
        )

        if re.search(
            pattern,
            name
        ):

            return True

    return False


# =========================================================
# CHECK FOOD AGAINST DIET PREFERENCE
# =========================================================

def is_food_allowed(
    food,
    diet_preference
):

    """
    Returns True when the food is compatible with the
    user's dietary preference.
    """

    food_name = food.name

    has_meat = (
        contains_food_keyword(
            food_name,
            MEAT_KEYWORDS
        )
    )

    has_seafood = (
        contains_food_keyword(
            food_name,
            SEAFOOD_KEYWORDS
        )
    )

    has_egg = (
        contains_food_keyword(
            food_name,
            EGG_KEYWORDS
        )
    )

    has_dairy = (
        contains_food_keyword(
            food_name,
            DAIRY_KEYWORDS
        )
    )

    # -----------------------------------------------------
    # NON-VEGETARIAN
    # -----------------------------------------------------

    if diet_preference == "Non-Vegetarian":

        return True

    # -----------------------------------------------------
    # VEGETARIAN
    # -----------------------------------------------------

    if diet_preference == "Vegetarian":

        if has_meat:
            return False

        if has_seafood:
            return False

        if has_egg:
            return False

        return True

    # -----------------------------------------------------
    # EGGETARIAN
    # -----------------------------------------------------

    if diet_preference == "Eggetarian":

        if has_meat:
            return False

        if has_seafood:
            return False

        return True

    # -----------------------------------------------------
    # VEGAN
    # -----------------------------------------------------

    if diet_preference == "Vegan":

        if has_meat:
            return False

        if has_seafood:
            return False

        if has_egg:
            return False

        if has_dairy:
            return False

        return True

    # -----------------------------------------------------
    # SAFE DEFAULT
    # -----------------------------------------------------

    # If an unexpected preference somehow exists,
    # default to vegetarian rather than exposing
    # potentially restricted foods.

    if has_meat:
        return False

    if has_seafood:
        return False

    if has_egg:
        return False

    return True


# =========================================================
# GET COMPATIBLE FOODS FOR DIET PLAN
# =========================================================

def get_compatible_foods(
    diet_plan,
    diet_preference
):

    """
    Returns only active foods compatible with the user's
    dietary preference.
    """

    all_foods = (
        diet_plan.foods
        .filter(is_active=True)
    )

    compatible_foods = []

    for food in all_foods:

        if is_food_allowed(
            food,
            diet_preference
        ):

            compatible_foods.append(
                food
            )

    return compatible_foods


# =========================================================
# CHECK WHETHER A DIET PLAN IS COMPATIBLE
# =========================================================

def is_diet_plan_compatible(
    diet_plan,
    diet_preference
):

    """
    A DietPlan is considered compatible only when it has
    at least one active food and ALL of its active foods
    are compatible with the user's dietary preference.

    This prevents a vegetarian user from receiving a meal
    plan that contains even one restricted food.
    """

    compatible_foods = (
        get_compatible_foods(
            diet_plan,
            diet_preference
        )
    )

    all_active_foods = (
        diet_plan.foods
        .filter(is_active=True)
    )

    # No foods means this is not a usable meal plan.

    if not all_active_foods.exists():

        return False

    # Every active food must be allowed.

    return (
        len(compatible_foods)
        == all_active_foods.count()
    )

# =========================================================
# CHECK DIET PLAN TEXT
# =========================================================

def is_diet_plan_text_compatible(
    diet_plan,
    diet_preference
):

    """
    Prevents a diet plan with a misleading name or
    description from being assigned to the user.

    Example:
        Vegetarian user should not receive a plan named
        'Chicken Protein Bowl'.
    """

    text = (
        f"{diet_plan.name} "
        f"{diet_plan.description}"
    ).lower()

    restricted_for_vegetarian = [
        "chicken",
        "mutton",
        "lamb",
        "goat",
        "beef",
        "pork",
        "bacon",
        "ham",
        "sausage",
        "salami",
        "pepperoni",
        "turkey",
        "duck",
        "fish",
        "salmon",
        "tuna",
        "sardine",
        "anchovy",
        "prawn",
        "shrimp",
        "crab",
        "lobster",
        "squid",
        "octopus",
        "seafood",
        "egg",
        "eggs",
        "omelette",
        "omelet",
    ]

    restricted_for_eggetarian = [
        "chicken",
        "mutton",
        "lamb",
        "goat",
        "beef",
        "pork",
        "bacon",
        "ham",
        "sausage",
        "salami",
        "pepperoni",
        "turkey",
        "duck",
        "fish",
        "salmon",
        "tuna",
        "sardine",
        "anchovy",
        "prawn",
        "shrimp",
        "crab",
        "lobster",
        "squid",
        "octopus",
        "seafood",
    ]

    restricted_for_vegan = [
        "chicken",
        "mutton",
        "lamb",
        "goat",
        "beef",
        "pork",
        "bacon",
        "ham",
        "sausage",
        "salami",
        "pepperoni",
        "turkey",
        "duck",
        "fish",
        "salmon",
        "tuna",
        "prawn",
        "shrimp",
        "crab",
        "lobster",
        "squid",
        "octopus",
        "seafood",
        "egg",
        "eggs",
        "omelette",
        "omelet",
        "milk",
        "paneer",
        "cheese",
        "curd",
        "yogurt",
        "yoghurt",
        "butter",
        "ghee",
        "cream",
        "whey",
        "casein",
    ]

    if diet_preference == "Vegetarian":

        return not any(
            keyword in text
            for keyword in restricted_for_vegetarian
        )

    if diet_preference == "Eggetarian":

        return not any(
            keyword in text
            for keyword in restricted_for_eggetarian
        )

    if diet_preference == "Vegan":

        return not any(
            keyword in text
            for keyword in restricted_for_vegan
        )

    # Non-Vegetarian has no restriction.

    return True

# =========================================================
# FIND COMPATIBLE DIET PLAN
# =========================================================

def find_compatible_diet_plan(
    profile,
    meal_type
):

    diet_plans = (
        DietPlan.objects
        .filter(
            goal=profile.fitness_goal,
            meal_type=meal_type,
            is_active=True
        )
        .prefetch_related("foods")
    )

    for diet_plan in diet_plans:

        # ---------------------------------------------
        # CHECK FOODS
        # ---------------------------------------------

        if not is_diet_plan_compatible(
            diet_plan,
            profile.diet_preference
        ):
            continue

        # ---------------------------------------------
        # CHECK NAME + DESCRIPTION
        # ---------------------------------------------

        if not is_diet_plan_text_compatible(
            diet_plan,
            profile.diet_preference
        ):
            continue

        return diet_plan

    return None


# =========================================================
# CREATE / GET TODAY'S DIET
# =========================================================

def get_or_create_today_diet(
    user,
    profile
):

    today = timezone.localdate()

    calorie_target = (
        calculate_calorie_target(
            profile
        )
    )

    # -----------------------------------------------------
    # GET OR CREATE TODAY'S DIET DAY
    # -----------------------------------------------------

    diet_day, created = (
        DietDay.objects.get_or_create(

            user=user,

            date=today,

            defaults={
                "calorie_target":
                    calorie_target,
            }

        )
    )

    # -----------------------------------------------------
    # UPDATE CALORIE TARGET
    # -----------------------------------------------------

    if diet_day.calorie_target != calorie_target:

        diet_day.calorie_target = (
            calorie_target
        )

        diet_day.save(
            update_fields=[
                "calorie_target"
            ]
        )

    # -----------------------------------------------------
    # ENSURE TODAY'S MEALS MATCH DIET PREFERENCE
    # -----------------------------------------------------

    meal_types = [

        "Breakfast",

        "Lunch",

        "Dinner",

        "Snack",

    ]

    # -----------------------------------------------------
    # REMOVE INCOMPATIBLE EXISTING MEALS
    # -----------------------------------------------------

    existing_meals = list(
        diet_day.meals
        .select_related("diet_plan")
        .all()
    )

    for diet_meal in existing_meals:

        if not is_diet_plan_compatible(
            diet_meal.diet_plan,
            profile.diet_preference
        ):

            diet_meal.delete()

    # -----------------------------------------------------
    # GET REMAINING MEAL TYPES
    # -----------------------------------------------------

    existing_meal_types = set(

        diet_day.meals.values_list(
            "diet_plan__meal_type",
            flat=True
        )

    )

    # -----------------------------------------------------
    # CREATE MISSING COMPATIBLE MEALS
    # -----------------------------------------------------

    for meal_type in meal_types:

        if meal_type in existing_meal_types:

            continue

        diet_plan = (
            find_compatible_diet_plan(
                profile,
                meal_type
            )
        )

        if diet_plan:

            DietMeal.objects.create(

                diet_day=diet_day,

                diet_plan=diet_plan

            )

    return diet_day


# =========================================================
# DIET API
# =========================================================

@require_http_methods(["GET"])
def diet_api(request):

    user = get_logged_in_user(
        request
    )

    if not user:

        return JsonResponse(

            {
                "success": False,
                "error": "Not logged in",
            },

            status=401

        )

    # -----------------------------------------------------
    # GET PROFILE
    # -----------------------------------------------------

    try:

        profile = UserProfile.objects.get(
            user=user
        )

    except UserProfile.DoesNotExist:

        return JsonResponse(

            {
                "success": False,
                "error": "Profile not found",
            },

            status=404

        )

    # -----------------------------------------------------
    # GET TODAY'S DIET
    # -----------------------------------------------------

    diet_day = (
        get_or_create_today_diet(
            user,
            profile
        )
    )

    meals = []

    total_calories = 0
    total_protein = 0
    total_carbohydrates = 0
    total_fats = 0

    # -----------------------------------------------------
    # GET MEALS
    # -----------------------------------------------------

    diet_meals = (
        diet_day.meals
        .select_related("diet_plan")
        .prefetch_related(
            "diet_plan__foods"
        )
        .all()
    )

    for diet_meal in diet_meals:

        diet_plan = (
            diet_meal.diet_plan
        )

        # -------------------------------------------------
        # GET ONLY COMPATIBLE FOODS
        # -------------------------------------------------

        compatible_foods = (
            get_compatible_foods(
                diet_plan,
                profile.diet_preference
            )
        )

        foods = []

        meal_calories = 0
        meal_protein = 0
        meal_carbohydrates = 0
        meal_fats = 0

        # -------------------------------------------------
        # FOOD DATA
        # -------------------------------------------------

        for food in compatible_foods:

            food_data = {

                "id":
                    food.id,

                "name":
                    food.name,

                "category":
                    food.category,

                "serving_size":
                    food.serving_size,

                "calories":
                    food.calories,

                "protein":
                    food.protein,

                "carbohydrates":
                    food.carbohydrates,

                "fats":
                    food.fats,

                "description":
                    food.description,

            }

            foods.append(
                food_data
            )

            meal_calories += (
                food.calories
            )

            meal_protein += (
                food.protein
            )

            meal_carbohydrates += (
                food.carbohydrates
            )

            meal_fats += (
                food.fats
            )

        # -------------------------------------------------
        # ADD MEAL TOTALS
        # -------------------------------------------------

        total_calories += (
            meal_calories
        )

        total_protein += (
            meal_protein
        )

        total_carbohydrates += (
            meal_carbohydrates
        )

        total_fats += (
            meal_fats
        )

        # -------------------------------------------------
        # ADD MEAL RESPONSE
        # -------------------------------------------------

        meals.append({

            "id":
                diet_meal.id,

            "meal_type":
                diet_plan.meal_type,

            "name":
                diet_plan.name,

            "description":
                diet_plan.description,

            "completed":
                diet_meal.completed,

            "completed_at": (

                diet_meal.completed_at.isoformat()

                if diet_meal.completed_at

                else None

            ),

            "foods":
                foods,

            "nutrition": {

                "calories":
                    meal_calories,

                "protein":
                    round(
                        meal_protein,
                        1
                    ),

                "carbohydrates":
                    round(
                        meal_carbohydrates,
                        1
                    ),

                "fats":
                    round(
                        meal_fats,
                        1
                    ),

            },

        })

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return JsonResponse({

        "success": True,

        "user": {

            "user_id":
                user.user_id,

            "full_name":
                user.full_name,

        },

        "diet_preference":
            profile.diet_preference,

        "diet_day": {

            "id":
                diet_day.id,

            "date":
                str(diet_day.date),

            "calorie_target":
                diet_day.calorie_target,

            "completed":
                diet_day.completed,

        },

        "nutrition": {

            "calories":
                total_calories,

            "protein":
                round(
                    total_protein,
                    1
                ),

            "carbohydrates":
                round(
                    total_carbohydrates,
                    1
                ),

            "fats":
                round(
                    total_fats,
                    1
                ),

        },

        "meals":
            meals,

    })


# =========================================================
# COMPLETE MEAL API
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def complete_meal_api(
    request,
    meal_id
):

    user = get_logged_in_user(
        request
    )

    if not user:

        return JsonResponse(

            {
                "success": False,
                "error": "Not logged in",
            },

            status=401

        )

    # -----------------------------------------------------
    # GET MEAL
    # -----------------------------------------------------

    try:

        diet_meal = (
            DietMeal.objects
            .select_related(
                "diet_day"
            )
            .get(

                id=meal_id,

                diet_day__user=user

            )
        )

    except DietMeal.DoesNotExist:

        return JsonResponse(

            {
                "success": False,
                "error": "Meal not found",
            },

            status=404

        )

    # -----------------------------------------------------
    # TOGGLE COMPLETION
    # -----------------------------------------------------

    if diet_meal.completed:

        diet_meal.completed = False

        diet_meal.completed_at = None

    else:

        diet_meal.completed = True

        diet_meal.completed_at = (
            timezone.now()
        )

    diet_meal.save(
        update_fields=[
            "completed",
            "completed_at",
        ]
    )

    # -----------------------------------------------------
    # CHECK ALL MEALS
    # -----------------------------------------------------

    total_meals = (
        diet_meal
        .diet_day
        .meals
        .count()
    )

    completed_meals = (
        diet_meal
        .diet_day
        .meals
        .filter(
            completed=True
        )
        .count()
    )

    diet_day_completed = (

        total_meals > 0

        and

        completed_meals == total_meals

    )

    diet_day = (
        diet_meal.diet_day
    )

    diet_day.completed = (
        diet_day_completed
    )

    diet_day.save(
        update_fields=[
            "completed"
        ]
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return JsonResponse({

        "success": True,

        "user": {

            "user_id":
                user.user_id,

            "full_name":
                user.full_name,

        },

        "meal_id":
            diet_meal.id,

        "completed":
            diet_meal.completed,

        "completed_meals":
            completed_meals,

        "total_meals":
            total_meals,

        "diet_completed":
            diet_day_completed,

    })