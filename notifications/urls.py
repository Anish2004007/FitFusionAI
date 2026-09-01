from django.urls import path

from . import views


urlpatterns = [

    # GET
    path(
        "api/",
        views.notifications_api,
        name="notifications_api",
    ),

    # MARK ONE AS READ
    path(
        "api/<int:notification_id>/read/",
        views.mark_notification_read,
        name="mark_notification_read",
    ),

    # MARK ALL AS READ
    path(
        "api/read-all/",
        views.mark_all_notifications_read,
        name="mark_all_notifications_read",
    ),

    # CLEAR ALL READ
    path(
        "api/clear-completed/",
        views.clear_completed_notifications,
        name="clear_completed_notifications",
    ),

    # DELETE ONE
    path(
        "api/<int:notification_id>/",
        views.delete_notification,
        name="delete_notification",
    ),
]