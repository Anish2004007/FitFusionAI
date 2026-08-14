from datetime import timedelta

from django.shortcuts import render, redirect
from django.utils import timezone

from accounts.models import User
from workout.models import WorkoutSession


def progress_home(request):

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

    # All completed workouts
    completed_workouts = WorkoutSession.objects.filter(
        user=user,
        completed=True
    )

    # Total completed workouts
    total_workouts = completed_workouts.count()

    # Start of current week
    today = timezone.localdate()

    week_start = today - timedelta(
        days=today.weekday()
    )

    # Completed workouts this week
    weekly_workouts = completed_workouts.filter(
        completed_at__date__gte=week_start
    ).count()

    # Total workout sessions
    total_sessions = WorkoutSession.objects.filter(
        user=user
    ).count()

    # Completion rate
    if total_sessions > 0:

        completion_rate = int(
            (total_workouts / total_sessions) * 100
        )

    else:

        completion_rate = 0

    # Recent workout history
    workout_history = completed_workouts.select_related(
        "workout_plan"
    ).order_by(
        "-completed_at"
    )[:10]

    context = {
        "user": user,
        "total_workouts": total_workouts,
        "weekly_workouts": weekly_workouts,
        "completion_rate": completion_rate,
        "workout_history": workout_history,
    }

    return render(
        request,
        "progress/progress.html",
        context
    )