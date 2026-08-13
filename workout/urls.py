from django.urls import path

from . import views


urlpatterns = [

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

]