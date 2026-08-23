from django.urls import path

from . import views


urlpatterns = [

    path(
        "api/",
        views.water_api,
        name="water_api"
    ),

    path(
        "api/add/",
        views.add_water,
        name="add_water"
    ),

    path(
        "api/delete/<int:water_id>/",
        views.delete_water,
        name="delete_water"
    ),

]