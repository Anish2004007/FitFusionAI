from django.urls import path

from . import views


urlpatterns = [

    path(
        "api/",
        views.ai_coach_api,
        name="ai_coach_api"
    ),

    path(
        "api/fitness-score/",
        views.fitness_score_api,
        name="fitness_score_api"
    ),

    path(
        "api/daily-plan/",
        views.ai_daily_plan_api,
        name="ai_daily_plan_api"
    ),

]