from django.shortcuts import render, redirect

from accounts.models import User
from profile_app.models import UserProfile
from .models import WorkoutPlan


def workout_home(request):

    # Check if user is logged in
    user_id = request.session.get("user_id")

    if not user_id:
        return redirect("login")

    # Get logged-in user
    try:
        user = User.objects.get(
            user_id=user_id
        )
    except User.DoesNotExist:
        request.session.flush()
        return redirect("login")

    # Get user profile
    try:
        profile = UserProfile.objects.get(
            user=user
        )
    except UserProfile.DoesNotExist:
        return redirect("profile_setup")

    # Find workout plan based on fitness goal
    workout_plan = WorkoutPlan.objects.filter(
        goal=profile.fitness_goal,
        is_active=True
    ).first()

    context = {
        "user": user,
        "profile": profile,
        "workout_plan": workout_plan,
    }

    return render(
        request,
        "workout/workout_home.html",
        context
    )