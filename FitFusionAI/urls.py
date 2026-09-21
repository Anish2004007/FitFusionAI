from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


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

    path(
        "notifications/",
        include("notifications.urls"),
    ),

]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)