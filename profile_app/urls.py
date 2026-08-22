from django.urls import path
from . import views

urlpatterns = [

    path(
        "setup/",
        views.profile_setup,
        name="profile_setup",
    ),

    path(
    "api/",
    views.profile_api,
    name="profile_api"
),

path(
    "api/update/",
    views.update_profile_api,
    name="update_profile_api"
),

]