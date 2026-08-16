from datetime import timedelta

from django.http import JsonResponse
from django.utils import timezone

from accounts.models import User
from workout.models import WorkoutSession


def progress_api(request):

    # Check login
    user_id = request.session.get("user_id")

    if not user_id:
        return JsonResponse(
            {
                "success": False,
                "error": "Not logged in",
            },
            status=401,
        )

    # Get logged-in user
    try:
        user = User.objects.get(
            user_id=user_id
        )

    except User.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "User not found",
            },
            status=401,
        )

    # Completed workouts
    completed_workouts = WorkoutSession.objects.filter(
        user=user,
        completed=True,
    )

    # Total completed workouts
    total_workouts = completed_workouts.count()

    # Today's date
    today = timezone.localdate()

    # Start of current week
    week_start = today - timedelta(
        days=today.weekday()
    )

    # Completed workouts this week
    weekly_workouts = completed_workouts.filter(
        completed_at__date__gte=week_start
    ).count()

    # All workout sessions
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

    # --------------------------------
    # Weekly activity - last 7 days
    # --------------------------------

    weekly_activity = []

    for days_ago in range(6, -1, -1):

        activity_date = today - timedelta(
            days=days_ago
        )

        workout_count = completed_workouts.filter(
            completed_at__date=activity_date
        ).count()

        weekly_activity.append(
            {
                "day": activity_date.strftime("%a"),
                "date": activity_date.strftime("%d %b"),
                "count": workout_count,
            }
        )

    # --------------------------------
    # Recent workout history
    # --------------------------------

    workout_history = []

    recent_workouts = completed_workouts.select_related(
        "workout_plan"
    ).order_by(
        "-completed_at"
    )[:10]

    for session in recent_workouts:

        workout_history.append(
            {
                "id": session.id,
                "name": session.workout_plan.name,
                "completed_at": (
                    session.completed_at.isoformat()
                    if session.completed_at
                    else None
                ),
            }
        )

    # --------------------------------
    # API response
    # --------------------------------

    return JsonResponse(
    {
        "success": True,

        "user": {
            "full_name": user.full_name,
        },

        "stats": {
            "total_workouts": total_workouts,
            "weekly_workouts": weekly_workouts,
            "completion_rate": completion_rate,
        },

        "weekly_activity": weekly_activity,

        "workout_history": workout_history,
    }
)