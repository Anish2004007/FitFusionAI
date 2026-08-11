from datetime import date

from django.shortcuts import render, redirect

from accounts.models import User
from profile_app.models import UserProfile


def calculate_age(date_of_birth):

    today = date.today()

    age = today.year - date_of_birth.year

    if (
        today.month,
        today.day
    ) < (
        date_of_birth.month,
        date_of_birth.day
    ):
        age -= 1

    return age


def dashboard(request):

    # -----------------------------
    # CHECK LOGIN
    # -----------------------------

    user_id = request.session.get("user_id")

    if not user_id:
        return redirect("login")


    # -----------------------------
    # GET USER
    # -----------------------------

    try:

        user = User.objects.get(
            user_id=user_id
        )

    except User.DoesNotExist:

        request.session.flush()

        return redirect("login")


    # -----------------------------
    # GET PROFILE
    # -----------------------------

    try:

        profile = UserProfile.objects.get(
            user=user
        )

    except UserProfile.DoesNotExist:

        return redirect("profile_setup")


    # -----------------------------
    # BASIC VALUES
    # -----------------------------

    height_cm = float(profile.height)

    weight_kg = float(profile.weight)


    # -----------------------------
    # BMI
    # -----------------------------

    height_m = height_cm / 100

    bmi = weight_kg / (height_m ** 2)

    bmi = round(bmi, 1)


    # -----------------------------
    # BMI CATEGORY
    # -----------------------------

    if bmi < 18.5:

        bmi_category = "Underweight"

    elif bmi < 25:

        bmi_category = "Normal"

    elif bmi < 30:

        bmi_category = "Overweight"

    else:

        bmi_category = "Obese"


    # -----------------------------
    # AGE
    # -----------------------------

    age = calculate_age(
        profile.date_of_birth
    )


    # -----------------------------
    # BMR
    # Mifflin-St Jeor Equation
    # -----------------------------

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

        # Neutral estimate for "Other"
        bmr = (
            10 * weight_kg
            + 6.25 * height_cm
            - 5 * age
            - 78
        )


    bmr = round(bmr)


    # -----------------------------
    # ACTIVITY MULTIPLIER
    # -----------------------------

    activity_multipliers = {

        "Sedentary": 1.2,

        "Lightly Active": 1.375,

        "Moderately Active": 1.55,

        "Very Active": 1.725,

        "Athlete": 1.9,

    }


    activity_multiplier = activity_multipliers.get(

        profile.activity_level,

        1.2

    )


    # -----------------------------
    # TDEE
    # -----------------------------

    tdee = bmr * activity_multiplier

    tdee = round(tdee)


    # -----------------------------
    # CALORIE TARGET
    # -----------------------------

    calorie_target = tdee


    if profile.fitness_goal == "Lose Weight":

        calorie_target = tdee - 500

    elif profile.fitness_goal == "Gain Muscle":

        calorie_target = tdee + 300

    elif profile.fitness_goal == "Maintain Weight":

        calorie_target = tdee

    elif profile.fitness_goal == "Improve Fitness":

        calorie_target = tdee


    # Prevent unrealistic negative target

    calorie_target = max(
        calorie_target,
        1200
    )


    # -----------------------------
    # WATER GOAL
    # -----------------------------

    water_goal = round(
        weight_kg * 0.033,
        1
    )


    # -----------------------------
    # CONTEXT
    # -----------------------------

    context = {

        "user": user,

        "profile": profile,

        "age": age,

        "bmi": bmi,

        "bmi_category": bmi_category,

        "bmr": bmr,

        "tdee": tdee,

        "calorie_target": calorie_target,

        "water_goal": water_goal,

        "fitness_goal": profile.fitness_goal,

    }


    return render(

        request,

        "dashboard/dashboard.html",

        context

    )