from django.urls import path

from . import views


urlpatterns = [

    path(
        "api/",
        views.notifications_api,
        name="notifications_api",
    ),

    path(
        "api/<int:notification_id>/read/",
        views.mark_notification_read,
        name="mark_notification_read",
    ),

    path(
        "api/read-all/",
        views.mark_all_notifications_read,
        name="mark_all_notifications_read",
    ),

    path(
        "api/<int:notification_id>/",
        views.delete_notification,
        name="delete_notification",
    ),

]