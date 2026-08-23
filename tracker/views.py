import json

from datetime import timedelta

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from accounts.models import User
from .models import WaterIntake


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


def get_daily_water_goal(user):
    """
    Get the user's daily water goal.

    The dashboard already calculates the recommended
    water goal from the user's profile. For the tracker,
    use that value when available.

    Default: 2000 ml.
    """

    try:
        profile = user.profile

        # Convert liters to milliliters if the
        # profile/dashboard stores the goal in liters.
        #
        # If no calculated goal exists, use 2 liters.

        if hasattr(profile, "water_goal"):

            goal = profile.water_goal

            if goal:
                return int(float(goal) * 1000)

    except Exception:
        pass

    return 2000


# =========================================================
# GET TODAY'S WATER
# =========================================================

@require_http_methods(["GET"])
def water_api(request):

    user = get_logged_in_user(request)

    if not user:

        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in."
            },
            status=401
        )


    now = timezone.localtime()

    start_of_day = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    end_of_day = (
        start_of_day +
        timedelta(days=1)
    )


    records = WaterIntake.objects.filter(
        user=user,
        consumed_at__gte=start_of_day,
        consumed_at__lt=end_of_day
    ).order_by(
        "-consumed_at"
    )


    total_consumed = sum(
        record.amount
        for record in records
    )


    daily_goal = get_daily_water_goal(
        user
    )


    percentage = 0

    if daily_goal > 0:

        percentage = round(
            (
                total_consumed /
                daily_goal
            ) * 100
        )


    history = []

    for record in records:

        local_time = timezone.localtime(
            record.consumed_at
        )

        history.append(
            {
                "id": record.id,

                "amount": record.amount,

                "time": local_time.strftime(
                    "%I:%M %p"
                ),

                "consumed_at":
                    record.consumed_at.isoformat()
            }
        )


    return JsonResponse(
    {
        "success": True,

        "user": {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
        },

        "water": {
            "daily_goal": daily_goal,
            "consumed": total_consumed,
            "remaining": max(
                daily_goal - total_consumed,
                0
            ),
            "percentage": min(
                percentage,
                100
            ),
            "history": history
        }
    }
)


# =========================================================
# ADD WATER
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def add_water(request):

    user = get_logged_in_user(request)

    if not user:

        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in."
            },
            status=401
        )


    try:

        data = json.loads(
            request.body
        )

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "success": False,
                "error": "Invalid JSON data."
            },
            status=400
        )


    amount = data.get(
        "amount"
    )


    try:

        amount = int(amount)

    except (
        TypeError,
        ValueError
    ):

        return JsonResponse(
            {
                "success": False,
                "error":
                    "Water amount must be a number."
            },
            status=400
        )


    if amount <= 0:

        return JsonResponse(
            {
                "success": False,
                "error":
                    "Water amount must be greater than zero."
            },
            status=400
        )


    if amount > 5000:

        return JsonResponse(
            {
                "success": False,
                "error":
                    "Water amount cannot exceed 5000 ml."
            },
            status=400
        )


    record = WaterIntake.objects.create(
        user=user,
        amount=amount
    )


    return JsonResponse(
        {
            "success": True,

            "message":
                "Water intake added successfully.",

            "record": {
                "id": record.id,

                "amount":
                    record.amount,

                "time":
                    timezone.localtime(
                        record.consumed_at
                    ).strftime(
                        "%I:%M %p"
                    )
            }
        }
    )


# =========================================================
# DELETE WATER RECORD
# =========================================================

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_water(request, water_id):

    user = get_logged_in_user(request)

    if not user:

        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in."
            },
            status=401
        )


    try:

        record = WaterIntake.objects.get(
            id=water_id,
            user=user
        )

    except WaterIntake.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error":
                    "Water record not found."
            },
            status=404
        )


    record.delete()


    return JsonResponse(
        {
            "success": True,

            "message":
                "Water intake removed successfully."
        }
    )