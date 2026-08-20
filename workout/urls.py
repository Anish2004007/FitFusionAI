from django.urls import path

from . import views
from . import api_views


urlpatterns = [

    # =========================================
    # EXISTING DJANGO WORKOUT PAGES
    # =========================================

    path(
        "",
        views.workout_home,
        name="workout"
    ),

    path(
        "start/",
        views.start_workout,
        name="start_workout"
    ),

    path(
        "session/<int:session_id>/",
        views.workout_session,
        name="workout_session"
    ),

    path(
        "session/<int:session_id>/complete/",
        views.complete_workout,
        name="complete_workout"
    ),

    path(
        "session/<int:session_id>/completed/",
        views.workout_completed,
        name="workout_completed"
    ),

    path(
        "session/<int:session_id>/exercise/<int:exercise_id>/complete/",
        views.complete_exercise,
        name="complete_exercise"
    ),


    # =========================================
    # REACT WORKOUT APIs
    # =========================================

    path(
        "api/",
        api_views.workout_api,
        name="workout_api"
    ),

    path(
        "api/start/",
        api_views.start_workout_api,
        name="start_workout_api"
    ),

    path(
        "api/session/<int:session_id>/",
        api_views.workout_session_api,
        name="workout_session_api"
    ),

    path(
        "api/session/<int:session_id>/exercise/<int:exercise_id>/complete/",
        api_views.complete_exercise_api,
        name="complete_exercise_api"
    ),

    path(
        "api/session/<int:session_id>/complete/",
        api_views.complete_workout_api,
        name="complete_workout_api"
    ),

]