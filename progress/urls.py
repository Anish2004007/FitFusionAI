from django.urls import path
from . import views


urlpatterns = [

    path(
        "",
        views.progress_home,
        name="progress"
    ),

]