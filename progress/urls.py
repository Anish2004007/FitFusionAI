from django.urls import path

from . import views
from . import api_views


urlpatterns = [

    # Normal Django Progress page
    path(
        "",
        views.progress_home,
        name="progress"
    ),

    # React API
    path(
        "api/",
        api_views.progress_api,
        name="progress_api"
    ),

]