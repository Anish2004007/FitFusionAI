from django.contrib import admin
from django.urls import path, include


urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "",
        include("accounts.urls")
    ),

    path(
        "dashboard/",
        include("dashboard.urls")
    ),

    path(
        "profile/",
        include("profile_app.urls")
    ),

    path(
        "workout/",
        include("workout.urls")
    ),

    path(
        "progress/",
        include("progress.urls")
    ),

    path(
        "diet/",
        include("diet.urls")
    ),

    path(
        "tracker/",
        include("tracker.urls")
    ),

    path(
        "ai-coach/",
        include("ai_coach.urls")
    ),

]