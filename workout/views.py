from django.shortcuts import render, redirect
from django.utils import timezone

from accounts.models import User
from profile_app.models import UserProfile
from .models import (
    WorkoutPlan,
    WorkoutSession,
    WorkoutExercise,
)
from django.http import JsonResponse

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

    # Check exercise completion
    total_exercises = workout_session.exercise_progress.count()

    completed_exercises = workout_session.exercise_progress.filter(
        completed=True
    ).count()

    # Do not allow incomplete workouts
    if (
        total_exercises == 0
        or completed_exercises != total_exercises
    ):
        return redirect(
            "workout_session",
            session_id=session_id
        )

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

    total_exercises = exercise_progress.count()

    completed_exercises = exercise_progress.filter(
        completed=True
    ).count()

    if total_exercises > 0:
        progress_percentage = int(
            (completed_exercises / total_exercises) * 100
        )
    else:
        progress_percentage = 0

    context = {
        "user": user,
        "workout_session": workout_session,
        "workout_plan": workout_session.workout_plan,
        "exercise_progress": exercise_progress,
        "total_exercises": total_exercises,
        "completed_exercises": completed_exercises,
        "progress_percentage": progress_percentage,
    }

    return render(
        request,
        "workout/workout_session.html",
        context
    )

def complete_exercise(request, session_id, exercise_id):

    # Check login
    user_id = request.session.get("user_id")

    if not user_id:
        return JsonResponse(
            {"success": False, "error": "Not logged in"},
            status=401
        )

    # Get logged-in user
    try:
        user = User.objects.get(
            user_id=user_id
        )
    except User.DoesNotExist:
        request.session.flush()

        return JsonResponse(
            {"success": False, "error": "User not found"},
            status=401
        )

    # Get this user's workout session
    try:
        workout_session = WorkoutSession.objects.get(
            id=session_id,
            user=user
        )
    except WorkoutSession.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Workout session not found"},
            status=404
        )
    if workout_session.completed:
        return JsonResponse(
            {
                "success": False,
                "error": "This workout has already been completed."
            },
            status=400
        )

    # Get exercise progress
    try:
        exercise_progress = WorkoutExercise.objects.get(
            workout_session=workout_session,
            exercise_id=exercise_id
        )
    except WorkoutExercise.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Exercise not found"},
            status=404
        )
    

    # Mark completed
    if not exercise_progress.completed:

        exercise_progress.completed = True
        exercise_progress.completed_at = timezone.now()
        exercise_progress.save()

    # Calculate progress
    total_exercises = workout_session.exercise_progress.count()

    completed_exercises = workout_session.exercise_progress.filter(
        completed=True
    ).count()

    if total_exercises > 0:
        progress_percentage = int(
            (completed_exercises / total_exercises) * 100
        )
    else:
        progress_percentage = 0

    return JsonResponse({
        "success": True,
        "completed_exercises": completed_exercises,
        "total_exercises": total_exercises,
        "progress_percentage": progress_percentage,
    })