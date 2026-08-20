from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from accounts.models import User
from profile_app.models import UserProfile

from .models import (
    WorkoutPlan,
    WorkoutSession,
    WorkoutExercise,
)


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
# WORKOUT HOME API
# =========================================================

@require_http_methods(["GET"])
def workout_api(request):

    user = get_logged_in_user(request)

    if not user:

        return JsonResponse(
            {
                "success": False,
                "error": "Not logged in"
            },
            status=401
        )

    try:

        profile = UserProfile.objects.get(
            user=user
        )

    except UserProfile.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "Profile not found"
            },
            status=404
        )

    workout_plan = (
        WorkoutPlan.objects
        .filter(
            goal=profile.fitness_goal,
            is_active=True
        )
        .prefetch_related("exercises")
        .first()
    )

    if not workout_plan:

        return JsonResponse(
            {
                "success": True,

                "user": {
                    "user_id": user.user_id,
                    "full_name": user.full_name,
                },

                "workout_plan": None,
            }
        )

    exercises = []

    for exercise in workout_plan.exercises.all():

        exercises.append(
            {
                "id": exercise.id,
                "name": exercise.name,
                "category": exercise.category,
                "muscle_group": exercise.muscle_group,
                "difficulty": exercise.difficulty,
                "description": exercise.description,
                "duration_minutes": exercise.duration_minutes,
                "calories_burned": exercise.calories_burned,
                "equipment": exercise.equipment,
            }
        )

    return JsonResponse(
        {
            "success": True,

            "user": {
                "user_id": user.user_id,
                "full_name": user.full_name,
            },

            "profile": {
                "fitness_goal": profile.fitness_goal,
            },

            "workout_plan": {

                "id": workout_plan.id,

                "name": workout_plan.name,

                "goal": workout_plan.goal,

                "difficulty": workout_plan.difficulty,

                "duration_minutes": (
                    workout_plan.duration_minutes
                ),

                "description": workout_plan.description,

                "exercises": exercises,

                "exercise_count": len(exercises),
            },
        }
    )


# =========================================================
# START WORKOUT API
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def start_workout_api(request):

    user = get_logged_in_user(request)

    if not user:

        return JsonResponse(
            {
                "success": False,
                "error": "Not logged in"
            },
            status=401
        )

    try:

        profile = UserProfile.objects.get(
            user=user
        )

    except UserProfile.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "Profile not found"
            },
            status=404
        )

    workout_plan = (
        WorkoutPlan.objects
        .filter(
            goal=profile.fitness_goal,
            is_active=True
        )
        .prefetch_related("exercises")
        .first()
    )

    if not workout_plan:

        return JsonResponse(
            {
                "success": False,
                "error": "No workout plan available."
            },
            status=404
        )

    workout_session = WorkoutSession.objects.create(
        user=user,
        workout_plan=workout_plan
    )

    for exercise in workout_plan.exercises.all():

        WorkoutExercise.objects.create(
            workout_session=workout_session,
            exercise=exercise
        )

    return JsonResponse(
        {
            "success": True,

            "session_id": workout_session.id,

            "message": "Workout started successfully."
        }
    )


# =========================================================
# WORKOUT SESSION API
# =========================================================

@require_http_methods(["GET"])
def workout_session_api(
    request,
    session_id
):

    user = get_logged_in_user(request)

    if not user:

        return JsonResponse(
            {
                "success": False,
                "error": "Not logged in"
            },
            status=401
        )

    try:

        workout_session = WorkoutSession.objects.get(
            id=session_id,
            user=user
        )

    except WorkoutSession.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "Workout session not found"
            },
            status=404
        )

    exercise_progress = (
        workout_session
        .exercise_progress
        .select_related("exercise")
        .all()
    )

    total_exercises = exercise_progress.count()

    completed_exercises = (
        exercise_progress
        .filter(completed=True)
        .count()
    )

    if total_exercises > 0:

        progress_percentage = int(
            (
                completed_exercises /
                total_exercises
            ) * 100
        )

    else:

        progress_percentage = 0

    exercises = []

    for progress in exercise_progress:

        exercise = progress.exercise

        exercises.append(
            {
                "id": progress.id,

                "exercise_id": exercise.id,

                "name": exercise.name,

                "category": exercise.category,

                "muscle_group": exercise.muscle_group,

                "difficulty": exercise.difficulty,

                "description": exercise.description,

                "duration_minutes": (
                    exercise.duration_minutes
                ),

                "calories_burned": (
                    exercise.calories_burned
                ),

                "equipment": exercise.equipment,

                "completed": progress.completed,

                "completed_at": (
                    progress.completed_at.isoformat()
                    if progress.completed_at
                    else None
                ),
            }
        )

    return JsonResponse(
        {
            "success": True,

            # =========================================
            # USER - ADDED FOR REFRESH-SAFE NAVBAR
            # =========================================

            "user": {
                "user_id": user.user_id,
                "full_name": user.full_name,
            },

            "session": {

                "id": workout_session.id,

                "started_at": (
                    workout_session.started_at.isoformat()
                    if workout_session.started_at
                    else None
                ),

                "completed": workout_session.completed,

                "completed_at": (
                    workout_session.completed_at.isoformat()
                    if workout_session.completed_at
                    else None
                ),
            },

            "workout_plan": {

                "id": workout_session.workout_plan.id,

                "name": (
                    workout_session
                    .workout_plan
                    .name
                ),

                "goal": (
                    workout_session
                    .workout_plan
                    .goal
                ),

                "difficulty": (
                    workout_session
                    .workout_plan
                    .difficulty
                ),

                "duration_minutes": (
                    workout_session
                    .workout_plan
                    .duration_minutes
                ),

                "description": (
                    workout_session
                    .workout_plan
                    .description
                ),
            },

            "completed_exercises": (
                completed_exercises
            ),

            "total_exercises": (
                total_exercises
            ),

            "progress_percentage": (
                progress_percentage
            ),

            "exercises": exercises,
        }
    )


# =========================================================
# COMPLETE EXERCISE API
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def complete_exercise_api(
    request,
    session_id,
    exercise_id
):

    user = get_logged_in_user(request)

    if not user:

        return JsonResponse(
            {
                "success": False,
                "error": "Not logged in"
            },
            status=401
        )

    try:

        workout_session = WorkoutSession.objects.get(
            id=session_id,
            user=user
        )

    except WorkoutSession.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "Workout session not found"
            },
            status=404
        )

    if workout_session.completed:

        return JsonResponse(
            {
                "success": False,
                "error": (
                    "This workout has already "
                    "been completed."
                )
            },
            status=400
        )

    try:

        exercise_progress = (
            WorkoutExercise.objects.get(
                workout_session=workout_session,
                exercise_id=exercise_id
            )
        )

    except WorkoutExercise.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "Exercise not found"
            },
            status=404
        )

    if not exercise_progress.completed:

        exercise_progress.completed = True

        exercise_progress.completed_at = (
            timezone.now()
        )

        exercise_progress.save()

    total_exercises = (
        workout_session
        .exercise_progress
        .count()
    )

    completed_exercises = (
        workout_session
        .exercise_progress
        .filter(completed=True)
        .count()
    )

    if total_exercises > 0:

        progress_percentage = int(
            (
                completed_exercises /
                total_exercises
            ) * 100
        )

    else:

        progress_percentage = 0

    return JsonResponse(
        {
            "success": True,

            "completed_exercises": (
                completed_exercises
            ),

            "total_exercises": (
                total_exercises
            ),

            "progress_percentage": (
                progress_percentage
            ),
        }
    )


# =========================================================
# COMPLETE WORKOUT API
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def complete_workout_api(
    request,
    session_id
):

    user = get_logged_in_user(request)

    if not user:

        return JsonResponse(
            {
                "success": False,
                "error": "Not logged in"
            },
            status=401
        )

    try:

        workout_session = WorkoutSession.objects.get(
            id=session_id,
            user=user
        )

    except WorkoutSession.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "Workout session not found"
            },
            status=404
        )

    total_exercises = (
        workout_session
        .exercise_progress
        .count()
    )

    completed_exercises = (
        workout_session
        .exercise_progress
        .filter(completed=True)
        .count()
    )

    if (
        total_exercises == 0
        or completed_exercises != total_exercises
    ):

        return JsonResponse(
            {
                "success": False,

                "error": (
                    "Complete all exercises "
                    "before finishing the workout."
                ),

                "completed_exercises": (
                    completed_exercises
                ),

                "total_exercises": (
                    total_exercises
                ),
            },
            status=400
        )

    if not workout_session.completed:

        workout_session.completed = True

        workout_session.completed_at = (
            timezone.now()
        )

        workout_session.save()

    return JsonResponse(
        {
            "success": True,

            # =========================================
            # USER - ADDED FOR REFRESH-SAFE NAVBAR
            # =========================================

            "user": {
                "user_id": user.user_id,
                "full_name": user.full_name,
            },

            "session_id": (
                workout_session.id
            ),

            "message": (
                "Workout completed successfully."
            ),

            "workout": {

                "name": (
                    workout_session
                    .workout_plan
                    .name
                ),

                "duration_minutes": (
                    workout_session
                    .workout_plan
                    .duration_minutes
                ),

                "completed_at": (
                    workout_session.completed_at.isoformat()
                    if workout_session.completed_at
                    else None
                ),
            },
        }
    )