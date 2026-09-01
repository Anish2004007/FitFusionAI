from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Case, When, Value, IntegerField

from accounts.models import User
from .models import Notification
from .notification_engine import generate_smart_notifications


# =========================================================
# GET LOGGED-IN USER
# =========================================================

def get_logged_in_user(request):
    """
    Get the currently logged-in FitFusion user
    from the Django session.
    """

    user_id = request.session.get("user_id")

    if not user_id:
        return None

    try:
        return User.objects.get(
            user_id=user_id
        )

    except User.DoesNotExist:
        return None


# =========================================================
# GET NOTIFICATIONS
# =========================================================

@require_http_methods(["GET"])
def notifications_api(request):

    user = get_logged_in_user(request)

    if not user:
        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in.",
            },
            status=401,
        )

    # =====================================================
    # GENERATE SMART NOTIFICATIONS
    # =====================================================

    try:
        generate_smart_notifications(user)

    except Exception as e:
        print(
            "SMART NOTIFICATION ERROR:",
            repr(e)
        )

    # =====================================================
    # PRIORITY SORTING
    #
    # High   = 3
    # Medium = 2
    # Low    = 1
    # =====================================================

    priority_order = Case(

        When(
            priority="high",
            then=Value(3)
        ),

        When(
            priority="medium",
            then=Value(2)
        ),

        When(
            priority="low",
            then=Value(1)
        ),

        default=Value(0),

        output_field=IntegerField(),
    )

    # =====================================================
    # GET NOTIFICATIONS
    #
    # 1. Unread first
    # 2. High priority
    # 3. Medium priority
    # 4. Low priority
    # 5. Newest first
    # =====================================================

    notifications = (
        Notification.objects
        .filter(
            user=user
        )
        .annotate(
            priority_order=priority_order
        )
        .order_by(
            "is_read",
            "-priority_order",
            "-created_at",
        )
    )

    # =====================================================
    # UNREAD COUNT
    # =====================================================

    unread_count = notifications.filter(
        is_read=False
    ).count()

    # =====================================================
    # BUILD RESPONSE
    # =====================================================

    notification_list = []

    for notification in notifications:

        local_time = timezone.localtime(
            notification.created_at
        )

        notification_list.append(
            {
                "id": notification.id,

                "type":
                    notification.notification_type,

                "title":
                    notification.title,

                "message":
                    notification.message,

                "priority":
                    notification.priority,

                "is_read":
                    notification.is_read,

                "created_at":
                    notification.created_at.isoformat(),

                "time":
                    local_time.strftime(
                        "%I:%M %p"
                    ),
            }
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return JsonResponse(
        {
            "success": True,

            "notifications":
                notification_list,

            "unread_count":
                unread_count,
        }
    )


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def mark_notification_read(
    request,
    notification_id
):

    user = get_logged_in_user(request)

    if not user:
        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in.",
            },
            status=401,
        )

    try:

        notification = Notification.objects.get(
            id=notification_id,
            user=user,
        )

    except Notification.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "Notification not found.",
            },
            status=404,
        )

    # Remember whether this notification
    # was actually unread.

    was_unread = not notification.is_read

    notification.is_read = True

    notification.save(
        update_fields=["is_read"]
    )

    return JsonResponse(
        {
            "success": True,

            "message":
                "Notification marked as read.",

            "was_unread":
                was_unread,
        }
    )


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def mark_all_notifications_read(request):

    user = get_logged_in_user(request)

    if not user:
        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in.",
            },
            status=401,
        )

    updated_count = (
        Notification.objects
        .filter(
            user=user,
            is_read=False,
        )
        .update(
            is_read=True
        )
    )

    return JsonResponse(
        {
            "success": True,

            "message":
                "All notifications marked as read.",

            "updated_count":
                updated_count,
        }
    )


# =========================================================
# CLEAR COMPLETED NOTIFICATIONS
#
# Deletes ONLY READ notifications.
#
# UNREAD notifications are NOT deleted.
# =========================================================

@csrf_exempt
@require_http_methods(["DELETE"])
def clear_completed_notifications(request):

    user = get_logged_in_user(request)

    if not user:
        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in.",
            },
            status=401,
        )

    deleted_count, _ = (
        Notification.objects
        .filter(
            user=user,
            is_read=True,
        )
        .delete()
    )

    return JsonResponse(
        {
            "success": True,

            "message":
                "Completed notifications cleared successfully.",

            "deleted_count":
                deleted_count,
        }
    )


# =========================================================
# DELETE ONE NOTIFICATION
# =========================================================

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_notification(
    request,
    notification_id
):

    user = get_logged_in_user(request)

    if not user:
        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in.",
            },
            status=401,
        )

    try:

        notification = Notification.objects.get(
            id=notification_id,
            user=user,
        )

    except Notification.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "Notification not found.",
            },
            status=404,
        )

    notification.delete()

    return JsonResponse(
        {
            "success": True,

            "message":
                "Notification deleted successfully.",
        }
    )