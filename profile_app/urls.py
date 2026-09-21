from django.urls import path
from . import views


urlpatterns = [

    path(
        "",
        views.profile_setup,
        name="profile_setup"
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

    path(
        "api/picture/",
        views.upload_profile_picture,
        name="upload_profile_picture"
    ),

    path(
        "api/remove-picture/",
        views.remove_profile_picture,
        name="remove_profile_picture"
    ),
]