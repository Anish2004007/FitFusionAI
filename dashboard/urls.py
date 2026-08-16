from django.urls import path

from . import views
from . import api_views


urlpatterns = [

    path(
        "",
        views.dashboard,
        name="dashboard"
    ),

    path(
        "api/",
        api_views.dashboard_api,
        name="dashboard_api"
    ),

]