from datetime import timedelta

from django.utils import timezone

from accounts.models import User
from profile_app.models import UserProfile
from workout.models import WorkoutSession
from diet.models import DietDay
from tracker.models import WaterIntake


def get_logged_in_user(request):
    """
    Get the currently logged-in FitFusion user
    from the Django session.
    """

    user_id = request.session.get("user_id")

    if not user_id:
        return None

    try:
        return User.objects.get(
            user_id=user_id
        )

    except User.DoesNotExist:
        return None


def get_user_profile(user):
    """
    Get the user's fitness profile.

    UserProfile has a OneToOne relationship
    with the custom accounts.User model.
    """

    try:
        return UserProfile.objects.get(
            user=user
        )

    except UserProfile.DoesNotExist:
        return None


def get_workout_context(user):
    """
    Collect recent and weekly workout information.
    """

    now = timezone.localtime()

    week_start = (
        now - timedelta(days=7)
    )

    sessions = WorkoutSession.objects.filter(
        user=user
    ).order_by(
        "-started_at"
    )

    weekly_completed = sessions.filter(
        completed=True,
        completed_at__gte=week_start
    ).count()

    total_completed = sessions.filter(
        completed=True
    ).count()

    recent_sessions = sessions[:5]

    recent_workouts = []

    for session in recent_sessions:

        recent_workouts.append(
            {
                "name":
                    session.workout_plan.name,

                "goal":
                    session.workout_plan.goal,

                "difficulty":
                    session.workout_plan.difficulty,

                "duration_minutes":
                    session.workout_plan.duration_minutes,

                "completed":
                    session.completed,

                "started_at":
                    session.started_at.isoformat(),

                "completed_at":
                    (
                        session.completed_at.isoformat()
                        if session.completed_at
                        else None
                    ),
            }
        )

    return {
        "weekly_completed":
            weekly_completed,

        "total_completed":
            total_completed,

        "recent_workouts":
            recent_workouts,
    }


def get_diet_context(user):
    """
    Collect the user's recent diet-day
    and meal completion information.
    """

    today = timezone.localdate()

    diet_days = DietDay.objects.filter(
        user=user
    ).order_by(
        "-date"
    )[:7]

    recent_diet = []

    for diet_day in diet_days:

        meals = diet_day.meals.all()

        total_meals = meals.count()

        completed_meals = meals.filter(
            completed=True
        ).count()

        recent_diet.append(
            {
                "date":
                    str(diet_day.date),

                "calorie_target":
                    diet_day.calorie_target,

                "completed":
                    diet_day.completed,

                "total_meals":
                    total_meals,

                "completed_meals":
                    completed_meals,
            }
        )

    today_diet = None

    try:

        today_diet_day = DietDay.objects.get(
            user=user,
            date=today
        )

        meals = today_diet_day.meals.all()

        today_diet = {
            "calorie_target":
                today_diet_day.calorie_target,

            "completed":
                today_diet_day.completed,

            "total_meals":
                meals.count(),

            "completed_meals":
                meals.filter(
                    completed=True
                ).count(),
        }

    except DietDay.DoesNotExist:

        pass

    return {
        "today":
            today_diet,

        "recent":
            recent_diet,
    }


def get_water_context(user):
    """
    Collect today's water intake.
    """

    now = timezone.localtime()

    start_of_day = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    end_of_day = (
        start_of_day +
        timedelta(days=1)
    )

    records = WaterIntake.objects.filter(
        user=user,
        consumed_at__gte=start_of_day,
        consumed_at__lt=end_of_day
    )

    consumed = sum(
        record.amount
        for record in records
    )

    # UserProfile does not contain a water_goal
    # field, so use the same 2000 ml fallback
    # currently used by the tracker.
    daily_goal = 2000

    percentage = 0

    if daily_goal > 0:

        percentage = round(
            (consumed / daily_goal) * 100
        )

    return {
        "daily_goal_ml":
            daily_goal,

        "consumed_ml":
            consumed,

        "remaining_ml":
            max(
                daily_goal - consumed,
                0
            ),

        "percentage":
            min(
                percentage,
                100
            ),
    }


def build_user_context(request):
    """
    Build a complete fitness context for Gemini.
    """

    user = get_logged_in_user(
        request
    )

    if not user:
        return None

    profile = get_user_profile(
        user
    )

    workout = get_workout_context(
        user
    )

    diet = get_diet_context(
        user
    )

    water = get_water_context(
        user
    )

    profile_data = None

    if profile:

        profile_data = {
            "date_of_birth":
                str(profile.date_of_birth),

            "gender":
                profile.gender,

            "height_cm":
                float(profile.height),

            "weight_kg":
                float(profile.weight),

            "target_weight_kg":
                float(profile.target_weight),

            "fitness_goal":
                profile.fitness_goal,

            "activity_level":
                profile.activity_level,

            "diet_preference":
                profile.diet_preference,

            "medical_conditions":
                profile.medical_conditions,

            "allergies":
                profile.allergies,
        }

    return {
        "user": {
            "user_id":
                user.user_id,

            "full_name":
                user.full_name,

            "email":
                user.email,
        },

        "profile":
            profile_data,

        "workout":
            workout,

        "diet":
            diet,

        "water":
            water,
    }