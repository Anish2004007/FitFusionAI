from datetime import timedelta

from django.utils import timezone

from notifications.models import Notification

from tracker.models import WaterIntake

from workout.models import WorkoutSession

from diet.models import DietMeal


# =========================================================
# PRIORITY CONSTANTS
# =========================================================

PRIORITY_HIGH = "high"

PRIORITY_MEDIUM = "medium"

PRIORITY_LOW = "low"


# =========================================================
# NOTIFICATION PRIORITY
# =========================================================

def get_notification_priority(
    notification_type,
    title="",
    message="",
):

    title_lower = (
        title or ""
    ).lower()

    message_lower = (
        message or ""
    ).lower()

    # =====================================================
    # HIGH PRIORITY
    # =====================================================

    high_keywords = [

        "goal achieved",

        "workout complete",

        "meals completed",

        "target reached",

        "daily target reached",

        "missed",

        "overdue",

        "important",

    ]

    for keyword in high_keywords:

        if (
            keyword in title_lower
            or
            keyword in message_lower
        ):

            return PRIORITY_HIGH

    # Goal notifications are important.

    if notification_type == "goal":

        return PRIORITY_HIGH

    # System notifications are important.

    if notification_type == "system":

        return PRIORITY_HIGH

    # =====================================================
    # LOW PRIORITY
    # =====================================================

    low_keywords = [

        "great job",

        "keep it up",

        "stay consistent",

        "well done",

        "good work",

        "encouragement",

    ]

    for keyword in low_keywords:

        if (
            keyword in title_lower
            or
            keyword in message_lower
        ):

            return PRIORITY_LOW

    # =====================================================
    # MEDIUM PRIORITY
    # =====================================================

    if notification_type in {

        "hydration",

        "workout",

        "diet",

        "ai",

    }:

        return PRIORITY_MEDIUM

    # =====================================================
    # DEFAULT
    # =====================================================

    return PRIORITY_LOW


# =========================================================
# CREATE SMART NOTIFICATION
# =========================================================

def create_notification(
    user,
    notification_type,
    title,
    message,
):

    now = timezone.now()

    priority = get_notification_priority(
        notification_type=
            notification_type,

        title=title,

        message=message,
    )

    # =====================================================
    # COOLDOWN
    # =====================================================

    cooldowns = {

        "hydration":
            timedelta(hours=4),

        "workout":
            timedelta(hours=12),

        "diet":
            timedelta(hours=6),

        "goal":
            timedelta(hours=24),

        "ai":
            timedelta(hours=12),

        "system":
            timedelta(hours=24),

    }

    cooldown = cooldowns.get(
        notification_type,
        timedelta(hours=24),
    )

    # =====================================================
    # MOST RECENT SAME TYPE
    # =====================================================

    latest_notification = (
        Notification.objects
        .filter(
            user=user,
            notification_type=
                notification_type,
        )
        .order_by(
            "-created_at"
        )
        .first()
    )

    # =====================================================
    # EXACT DUPLICATE
    # =====================================================

    if latest_notification:

        if (
            latest_notification.title
            == title
            and
            latest_notification.message
            == message
        ):

            # Keep its priority synchronized.

            if (
                latest_notification.priority
                != priority
            ):

                latest_notification.priority = (
                    priority
                )

                latest_notification.save(
                    update_fields=[
                        "priority"
                    ]
                )

            return latest_notification

    # =====================================================
    # COOLDOWN
    # =====================================================

    if latest_notification:

        next_allowed_time = (
            latest_notification.created_at
            + cooldown
        )

        if now < next_allowed_time:

            return latest_notification

    # =====================================================
    # RECENT NOTIFICATION LIMIT
    #
    # Prevent notification flooding.
    # =====================================================

    recent_window = (
        now - timedelta(hours=2)
    )

    recent_count = (
        Notification.objects
        .filter(
            user=user,
            created_at__gte=
                recent_window,
        )
        .count()
    )

    # Low-value notifications can be
    # suppressed when the panel is already busy.

    if (
        priority == PRIORITY_LOW
        and recent_count >= 3
    ):

        return latest_notification

    if (
        priority == PRIORITY_MEDIUM
        and recent_count >= 5
    ):

        return latest_notification

    # =====================================================
    # NEW RELEVANT STATE
    #
    # Previous unread notifications
    # of the same type become read.
    # =====================================================

    Notification.objects.filter(
        user=user,
        notification_type=
            notification_type,
        is_read=False,
    ).update(
        is_read=True
    )

    # =====================================================
    # CREATE
    # =====================================================

    return Notification.objects.create(

        user=user,

        notification_type=
            notification_type,

        title=title,

        message=message,

        priority=priority,

        is_read=False,

    )


# =========================================================
# TIME PERIOD
# =========================================================

def get_time_period():

    hour = (
        timezone.localtime().hour
    )

    if 5 <= hour < 12:

        return "morning"

    if 12 <= hour < 17:

        return "afternoon"

    if 17 <= hour < 21:

        return "evening"

    return "night"


# =========================================================
# HYDRATION
# =========================================================

def check_hydration(
    user,
    period,
):

    today = timezone.localdate()

    water_entries = (
        WaterIntake.objects
        .filter(
            user=user,
            consumed_at__date=
                today,
        )
        .values_list(
            "amount",
            flat=True,
        )
    )

    total_water = sum(
        water_entries
    )

    daily_target = 2000

    # =====================================================
    # GOAL ACHIEVED
    # =====================================================

    if total_water >= daily_target:

        create_notification(

            user=user,

            notification_type=
                "hydration",

            title=
                "💧 Hydration Goal Achieved",

            message=(
                f"Great job! You've reached "
                f"{total_water} ml of water today. "
                "Keep staying hydrated."
            ),

        )

        return

    # =====================================================
    # MORNING
    # =====================================================

    if period == "morning":

        if total_water == 0:

            create_notification(

                user=user,

                notification_type=
                    "hydration",

                title=
                    "💧 Start Your Hydration",

                message=(
                    "Good morning! Start your day "
                    "with a glass of water and work "
                    "toward your daily hydration goal."
                ),

            )

        return

    # =====================================================
    # AFTERNOON
    # =====================================================

    if period == "afternoon":

        if total_water < 1000:

            remaining = (
                daily_target
                - total_water
            )

            create_notification(

                user=user,

                notification_type=
                    "hydration",

                title=
                    "💧 Hydration Reminder",

                message=(
                    f"You've had {total_water} ml "
                    f"of water today. About "
                    f"{remaining} ml remains to reach "
                    "your daily goal."
                ),

            )

        return

    # =====================================================
    # EVENING
    # =====================================================

    if period == "evening":

        if total_water < daily_target:

            remaining = (
                daily_target
                - total_water
            )

            create_notification(

                user=user,

                notification_type=
                    "hydration",

                title=
                    "💧 Evening Hydration Check",

                message=(
                    f"You've had {total_water} ml today. "
                    f"Try to get another {remaining} ml "
                    "before the end of the day."
                ),

            )

        return

    # =====================================================
    # NIGHT
    # =====================================================

    if period == "night":

        if total_water < daily_target:

            remaining = (
                daily_target
                - total_water
            )

            create_notification(

                user=user,

                notification_type=
                    "hydration",

                title=
                    "💧 Hydration Check-In",

                message=(
                    f"You finished today with "
                    f"{total_water} ml of water. "
                    f"Try to stay closer to your "
                    f"hydration target tomorrow."
                ),

            )


# =========================================================
# WORKOUT
# =========================================================

def check_workout(
    user,
    period,
):

    today = timezone.localdate()

    completed_today = (
        WorkoutSession.objects
        .filter(
            user=user,
            completed=True,
            completed_at__date=
                today,
        )
        .exists()
    )

    # =====================================================
    # COMPLETED
    # =====================================================

    if completed_today:

        create_notification(

            user=user,

            notification_type=
                "workout",

            title=
                "💪 Workout Complete",

            message=(
                "Great work! You completed "
                "a workout today. Keep your "
                "consistency going."
            ),

        )

        return

    # =====================================================
    # MORNING
    # =====================================================

    if period == "morning":

        create_notification(

            user=user,

            notification_type=
                "workout",

            title=
                "💪 Today's Workout",

            message=(
                "Plan a workout for today and "
                "keep moving toward your fitness goal."
            ),

        )

        return

    # =====================================================
    # AFTERNOON
    # =====================================================

    if period == "afternoon":

        create_notification(

            user=user,

            notification_type=
                "workout",

            title=
                "💪 Workout Reminder",

            message=(
                "You haven't completed a workout "
                "today. A short session can help "
                "you stay consistent with your "
                "fitness goal."
            ),

        )

        return

    # =====================================================
    # EVENING
    # =====================================================

    if period == "evening":

        create_notification(

            user=user,

            notification_type=
                "workout",

            title=
                "💪 Evening Workout Reminder",

            message=(
                "You still have time for a workout "
                "today. Even a short session is "
                "better than skipping your routine."
            ),

        )

        return

    # =====================================================
    # NIGHT
    # =====================================================

    if period == "night":

        create_notification(

            user=user,

            notification_type=
                "workout",

            title=
                "💪 Workout Check-In",

            message=(
                "You didn't complete a workout today. "
                "Don't worry—reset tomorrow and stay "
                "consistent with your fitness journey."
            ),

        )


# =========================================================
# DIET
# =========================================================

def check_diet(
    user,
    period,
):

    today = timezone.localdate()

    meals = (
        DietMeal.objects
        .filter(
            diet_day__user=user,
            diet_day__date=today,
        )
    )

    total_meals = meals.count()

    completed_meals = (
        meals
        .filter(
            completed=True
        )
        .count()
    )

    if total_meals == 0:

        return

    # =====================================================
    # ALL COMPLETED
    # =====================================================

    if (
        completed_meals
        == total_meals
    ):

        create_notification(

            user=user,

            notification_type=
                "diet",

            title=
                "🍽️ Meals Completed",

            message=(
                "Excellent! You've completed "
                "all your scheduled meals for today."
            ),

        )

        return

    remaining = (
        total_meals
        - completed_meals
    )

    # =====================================================
    # MORNING
    # =====================================================

    if period == "morning":

        create_notification(

            user=user,

            notification_type=
                "diet",

            title=
                "🍳 Breakfast Reminder",

            message=(
                "Start your day with a balanced "
                "meal and remember to log your breakfast."
            ),

        )

        return

    # =====================================================
    # AFTERNOON
    # =====================================================

    if period == "afternoon":

        create_notification(

            user=user,

            notification_type=
                "diet",

            title=
                "🍽️ Meal Tracking Reminder",

            message=(
                f"You have {remaining} meal"
                f"{'s' if remaining != 1 else ''} "
                "remaining to log today."
            ),

        )

        return

    # =====================================================
    # EVENING
    # =====================================================

    if period == "evening":

        create_notification(

            user=user,

            notification_type=
                "diet",

            title=
                "🍽️ Evening Meal Check",

            message=(
                f"You still have {remaining} meal"
                f"{'s' if remaining != 1 else ''} "
                "to complete today."
            ),

        )

        return

    # =====================================================
    # NIGHT
    # =====================================================

    if period == "night":

        create_notification(

            user=user,

            notification_type=
                "diet",

            title=
                "🍽️ Daily Nutrition Review",

            message=(
                f"You completed {completed_meals} "
                f"of {total_meals} scheduled meals today. "
                "Try to keep your meal tracking consistent."
            ),

        )


# =========================================================
# FITNESS GOAL
# =========================================================

def check_goal(
    user,
    period,
):

    if not user.goal:

        return

    if period != "morning":

        return

    goal = user.goal.lower()

    if "lose" in goal:

        create_notification(

            user=user,

            notification_type=
                "goal",

            title=
                "🎯 Weight Loss Focus",

            message=(
                "Start your day focused on your goal. "
                "Stay consistent with your meals, "
                "hydration and workouts."
            ),

        )

    elif "gain" in goal:

        create_notification(

            user=user,

            notification_type=
                "goal",

            title=
                "🎯 Muscle Gain Focus",

            message=(
                "Stay consistent with your workouts "
                "and nutrition to support your "
                "muscle-building goal."
            ),

        )

    else:

        create_notification(

            user=user,

            notification_type=
                "goal",

            title=
                "🎯 Fitness Goal Focus",

            message=(
                "Stay consistent with your daily "
                "fitness habits and keep moving "
                "toward your goal."
            ),

        )


# =========================================================
# GENERATE ALL SMART NOTIFICATIONS
# =========================================================

def generate_smart_notifications(user):

    period = get_time_period()

    check_hydration(
        user,
        period,
    )

    check_workout(
        user,
        period,
    )

    check_diet(
        user,
        period,
    )

    check_goal(
        user,
        period,
    )