from django.urls import path

from . import views


urlpatterns = [

    path(
        "",
        views.workout_home,
        name="workout"
    ),

]