from django.urls import path

from . import views


urlpatterns = [

    # Diet dashboard
    path(
        "api/",
        views.diet_api,
        name="diet_api"
    ),

    # Complete / uncomplete meal
    path(
        "api/meal/<int:meal_id>/complete/",
        views.complete_meal_api,
        name="complete_meal_api"
    ),

]