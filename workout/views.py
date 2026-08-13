from django.shortcuts import render, redirect
from django.utils import timezone

from accounts.models import User
from profile_app.models import UserProfile
from .models import (
    WorkoutPlan,
    WorkoutSession,
    WorkoutExercise,
)


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

from django.utils import timezone


def start_workout(request):

    # Check login
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

    # Find workout plan
    workout_plan = WorkoutPlan.objects.filter(
        goal=profile.fitness_goal,
        is_active=True
    ).first()

    if not workout_plan:
        return redirect("workout")

    # Create workout session
    workout_session = WorkoutSession.objects.create(
        user=user,
        workout_plan=workout_plan
    )

    # Create progress record for every exercise
    for exercise in workout_plan.exercises.all():

        WorkoutExercise.objects.create(
            workout_session=workout_session,
            exercise=exercise
        )

    return redirect(
        "workout_session",
        session_id=workout_session.id
    )

def complete_workout(request, session_id):

    # Check login
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

    # Get this user's workout session
    try:
        workout_session = WorkoutSession.objects.get(
            id=session_id,
            user=user
        )
    except WorkoutSession.DoesNotExist:
        return redirect("workout")

    # Mark workout as completed
    workout_session.completed = True
    workout_session.completed_at = timezone.now()
    workout_session.save()

    return redirect(
        "workout_completed",
        session_id=workout_session.id
    )

def workout_completed(request, session_id):

    # Check login
    user_id = request.session.get("user_id")

    if not user_id:
        return redirect("login")

    # Get user
    try:
        user = User.objects.get(
            user_id=user_id
        )
    except User.DoesNotExist:
        request.session.flush()
        return redirect("login")

    # Get completed session
    try:
        workout_session = WorkoutSession.objects.get(
            id=session_id,
            user=user
        )
    except WorkoutSession.DoesNotExist:
        return redirect("workout")

    context = {
        "user": user,
        "workout_session": workout_session,
        "workout_plan": workout_session.workout_plan,
    }

    return render(
        request,
        "workout/workout_completed.html",
        context
    )

def workout_session(request, session_id):

    # Check login
    user_id = request.session.get("user_id")

    if not user_id:
        return redirect("login")

    # Get user
    try:
        user = User.objects.get(
            user_id=user_id
        )
    except User.DoesNotExist:
        request.session.flush()
        return redirect("login")

    # Get this user's workout session
    try:
        workout_session = WorkoutSession.objects.get(
            id=session_id,
            user=user
        )
    except WorkoutSession.DoesNotExist:
        return redirect("workout")

    # Get exercise progress records
    exercise_progress = workout_session.exercise_progress.select_related(
        "exercise"
    ).all()

    context = {
        "user": user,
        "workout_session": workout_session,
        "workout_plan": workout_session.workout_plan,
        "exercise_progress": exercise_progress,
    }

    return render(
        request,
        "workout/workout_session.html",
        context
    )