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
    user_id = request.session.get("user_id")

    if not user_id:
        return None

    try:
        return User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return None


# =========================================================
# SERIALIZE NOTIFICATION
# =========================================================

def serialize_notification(notification):
    local_time = timezone.localtime(notification.created_at)

    return {
        "id": int(notification.id),

        "type": notification.notification_type,

        "notification_type": notification.notification_type,

        "title": notification.title,

        "message": notification.message,

        "priority": (
            notification.priority or "medium"
        ).lower(),

        "is_read": bool(notification.is_read),

        "created_at": (
            notification.created_at.isoformat()
        ),

        "time": local_time.strftime("%I:%M %p"),
    }


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

    # Generate smart notifications.
    try:
        generate_smart_notifications(user)
    except Exception as error:
        print(
            "SMART NOTIFICATION ERROR:",
            repr(error),
        )

    priority_order = Case(
        When(
            priority="high",
            then=Value(3),
        ),
        When(
            priority="medium",
            then=Value(2),
        ),
        When(
            priority="low",
            then=Value(1),
        ),
        default=Value(0),
        output_field=IntegerField(),
    )

    notifications = (
        Notification.objects
        .filter(user=user)
        .annotate(
            priority_order=priority_order
        )
        .order_by(
            "is_read",
            "-priority_order",
            "-created_at",
        )
    )

    unread_count = (
        Notification.objects
        .filter(
            user=user,
            is_read=False,
        )
        .count()
    )

    notification_list = [
        serialize_notification(notification)
        for notification in notifications
    ]

    return JsonResponse(
        {
            "success": True,

            "notifications":
                notification_list,

            "unread_count":
                unread_count,

            "total_count":
                len(notification_list),

            "read_count":
                len(notification_list) - unread_count,
        }
    )


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def mark_notification_read(
    request,
    notification_id,
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

    was_unread = not notification.is_read

    notification.is_read = True

    notification.save(
        update_fields=["is_read"]
    )

    unread_count = (
        Notification.objects
        .filter(
            user=user,
            is_read=False,
        )
        .count()
    )

    return JsonResponse(
        {
            "success": True,

            "message":
                "Notification marked as read.",

            "was_unread":
                was_unread,

            "unread_count":
                unread_count,
        }
    )


# =========================================================
# MARK ALL AS READ
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

    total_count = (
        Notification.objects
        .filter(user=user)
        .count()
    )

    return JsonResponse(
        {
            "success": True,

            "message":
                "All notifications marked as read.",

            "updated_count":
                updated_count,

            "unread_count":
                0,

            "total_count":
                total_count,
        }
    )


# =========================================================
# CLEAR COMPLETED / READ NOTIFICATIONS
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

    unread_count = (
        Notification.objects
        .filter(
            user=user,
            is_read=False,
        )
        .count()
    )

    total_count = (
        Notification.objects
        .filter(user=user)
        .count()
    )

    return JsonResponse(
        {
            "success": True,

            "message":
                "Completed notifications cleared successfully.",

            "deleted_count":
                deleted_count,

            "unread_count":
                unread_count,

            "total_count":
                total_count,
        }
    )


# =========================================================
# DELETE ONE NOTIFICATION
# =========================================================

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_notification(
    request,
    notification_id,
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

    unread_count = (
        Notification.objects
        .filter(
            user=user,
            is_read=False,
        )
        .count()
    )

    total_count = (
        Notification.objects
        .filter(user=user)
        .count()
    )

    return JsonResponse(
        {
            "success": True,

            "message":
                "Notification deleted successfully.",

            "unread_count":
                unread_count,

            "total_count":
                total_count,
        }
    )