from datetime import timedelta

from django.utils import timezone

from notifications.models import Notification
from tracker.models import WaterIntake
from workout.models import WorkoutSession
from diet.models import DietMeal


# =========================================================
# NOTIFICATION PRIORITY
# =========================================================

PRIORITY_HIGH = "high"
PRIORITY_MEDIUM = "medium"
PRIORITY_LOW = "low"


def get_notification_priority(
    notification_type,
    title="",
    message="",
):
    """
    Determine the importance of a notification.

    HIGH:
        Important actions, missed activities,
        achievements, or goal-related information.

    MEDIUM:
        Useful reminders that require attention.

    LOW:
        General encouragement or informational messages.
    """

    title_lower = title.lower()
    message_lower = message.lower()

    # =====================================================
    # HIGH PRIORITY
    # =====================================================

    high_keywords = [
        "goal achieved",
        "workout complete",
        "meals completed",
        "daily target reached",
        "target reached",
        "missed",
        "overdue",
        "important",
    ]

    for keyword in high_keywords:

        if (
            keyword in title_lower
            or keyword in message_lower
        ):
            return PRIORITY_HIGH

    # Goal notifications are important because
    # they directly relate to the user's fitness objective.

    if notification_type == "goal":
        return PRIORITY_HIGH

    # System notifications may contain important
    # application-level information.

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
            or keyword in message_lower
        ):
            return PRIORITY_LOW

    # =====================================================
    # MEDIUM PRIORITY
    # =====================================================

    medium_types = {
        "hydration",
        "workout",
        "diet",
        "ai",
    }

    if notification_type in medium_types:
        return PRIORITY_MEDIUM

    # =====================================================
    # DEFAULT
    # =====================================================

    return PRIORITY_LOW


# =========================================================
# COMMON NOTIFICATION CREATOR
# =========================================================

def create_notification(
    user,
    notification_type,
    title,
    message,
):
    """
    Create a relevant notification while preventing
    unnecessary repeated notifications.

    Phase 5E.2:
        - Exact duplicate prevention
        - Type-based cooldown
        - Previous unread notifications become read
          when a new relevant notification is created.

    Phase 5E.3:
        - Notification priority
        - Intelligent filtering
        - High-priority notifications can bypass
          normal low-value filtering.
    """

    now = timezone.now()

    # =====================================================
    # DETERMINE PRIORITY
    # =====================================================

    priority = get_notification_priority(
        notification_type=notification_type,
        title=title,
        message=message,
    )

    # =====================================================
    # COOLDOWN PERIODS
    # =====================================================

    cooldowns = {
        "hydration": timedelta(hours=4),
        "workout": timedelta(hours=12),
        "diet": timedelta(hours=6),
        "goal": timedelta(hours=24),
        "ai": timedelta(hours=12),
        "system": timedelta(hours=24),
    }

    cooldown = cooldowns.get(
        notification_type,
        timedelta(hours=24),
    )

    # =====================================================
    # GET MOST RECENT NOTIFICATION
    # =====================================================

    latest_notification = (
        Notification.objects
        .filter(
            user=user,
            notification_type=notification_type,
        )
        .order_by("-created_at")
        .first()
    )

    # =====================================================
    # EXACT DUPLICATE CHECK
    # =====================================================

    if latest_notification:

        if (
            latest_notification.title == title
            and latest_notification.message == message
        ):
            return latest_notification

    # =====================================================
    # COOLDOWN CHECK
    # =====================================================

    if latest_notification:

        next_allowed_time = (
            latest_notification.created_at
            + cooldown
        )

        if now < next_allowed_time:

            return latest_notification

    # =====================================================
    # INTELLIGENT FILTERING
    # =====================================================

    # Count recent notifications across all types.
    #
    # This prevents the notification system from
    # generating too many low-value notifications
    # in a short period.

    recent_window = now - timedelta(hours=2)

    recent_notifications = (
        Notification.objects
        .filter(
            user=user,
            created_at__gte=recent_window,
        )
    )

    recent_count = recent_notifications.count()

    # =====================================================
    # LOW PRIORITY FILTER
    # =====================================================

    # If several notifications were already generated
    # recently, don't add another low-priority message.

    if (
        priority == PRIORITY_LOW
        and recent_count >= 3
    ):
        return latest_notification

    # =====================================================
    # MEDIUM PRIORITY FILTER
    # =====================================================

    # Avoid flooding the user with multiple medium
    # priority notifications within a short period.

    if (
        priority == PRIORITY_MEDIUM
        and recent_count >= 5
    ):
        return latest_notification

    # =====================================================
    # HIGH PRIORITY NOTIFICATIONS
    # =====================================================

    # High-priority notifications are allowed through
    # the volume filter because they contain information
    # that should not be silently suppressed.

    # =====================================================
    # MARK PREVIOUS SAME-TYPE NOTIFICATIONS READ
    # =====================================================

    Notification.objects.filter(
        user=user,
        notification_type=notification_type,
        is_read=False,
    ).update(
        is_read=True
    )

    # =====================================================
    # CREATE NEW NOTIFICATION
    # =====================================================

    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        is_read=False,
    )


# =========================================================
# TIME OF DAY
# =========================================================

def get_time_period():
    """
    Determine the current local time period.

    Morning:   5 AM - 11:59 AM
    Afternoon: 12 PM - 4:59 PM
    Evening:   5 PM - 8:59 PM
    Night:     9 PM onwards
    """

    hour = timezone.localtime().hour

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

def check_hydration(user, period):

    today = timezone.localdate()

    water_entries = (
        WaterIntake.objects
        .filter(
            user=user,
            consumed_at__date=today,
        )
        .values_list(
            "amount",
            flat=True,
        )
    )

    total_water = sum(water_entries)

    daily_target = 2000

    # =====================================================
    # GOAL ACHIEVED
    # =====================================================

    if total_water >= daily_target:

        create_notification(
            user=user,
            notification_type="hydration",
            title="💧 Hydration Goal Achieved",
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
                notification_type="hydration",
                title="💧 Start Your Hydration",
                message=(
                    "Good morning! Start your day with "
                    "a glass of water and work toward "
                    "your daily hydration goal."
                ),
            )

        return

    # =====================================================
    # AFTERNOON
    # =====================================================

    if period == "afternoon":

        if total_water < 1000:

            remaining = daily_target - total_water

            create_notification(
                user=user,
                notification_type="hydration",
                title="💧 Hydration Reminder",
                message=(
                    f"You've had {total_water} ml of water "
                    f"today. About {remaining} ml remains "
                    "to reach your daily goal."
                ),
            )

        return

    # =====================================================
    # EVENING
    # =====================================================

    if period == "evening":

        if total_water < daily_target:

            remaining = daily_target - total_water

            create_notification(
                user=user,
                notification_type="hydration",
                title="💧 Evening Hydration Check",
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

            create_notification(
                user=user,
                notification_type="hydration",
                title="💧 Daily Hydration Review",
                message=(
                    f"You finished the day at "
                    f"{total_water} ml of water. "
                    "Try to stay closer to your hydration "
                    "target tomorrow."
                ),
            )


# =========================================================
# WORKOUT
# =========================================================

def check_workout(user, period):

    today = timezone.localdate()

    completed_today = (
        WorkoutSession.objects
        .filter(
            user=user,
            completed=True,
            completed_at__date=today,
        )
        .exists()
    )

    # =====================================================
    # WORKOUT COMPLETED
    # =====================================================

    if completed_today:

        create_notification(
            user=user,
            notification_type="workout",
            title="💪 Workout Complete",
            message=(
                "Great work! You completed a workout "
                "today. Keep your consistency going."
            ),
        )

        return

    # =====================================================
    # MORNING
    # =====================================================

    if period == "morning":

        create_notification(
            user=user,
            notification_type="workout",
            title="💪 Today's Workout",
            message=(
                "Plan a workout for today and keep "
                "moving toward your fitness goal."
            ),
        )

        return

    # =====================================================
    # AFTERNOON
    # =====================================================

    if period == "afternoon":

        create_notification(
            user=user,
            notification_type="workout",
            title="💪 Workout Reminder",
            message=(
                "You haven't completed a workout today. "
                "A short session can help you stay "
                "consistent with your fitness goal."
            ),
        )

        return

    # =====================================================
    # EVENING
    # =====================================================

    if period == "evening":

        create_notification(
            user=user,
            notification_type="workout",
            title="💪 Evening Workout Reminder",
            message=(
                "You still have time for a workout today. "
                "Even a short session is better than "
                "skipping your routine."
            ),
        )

        return

    # =====================================================
    # NIGHT
    # =====================================================

    if period == "night":

        create_notification(
            user=user,
            notification_type="workout",
            title="💪 Workout Check-In",
            message=(
                "You didn't complete a workout today. "
                "Don't worry—reset tomorrow and stay "
                "consistent with your fitness journey."
            ),
        )


# =========================================================
# DIET
# =========================================================

def check_diet(user, period):

    today = timezone.localdate()

    meals = DietMeal.objects.filter(
        diet_day__user=user,
        diet_day__date=today,
    )

    total_meals = meals.count()

    completed_meals = meals.filter(
        completed=True
    ).count()

    # =====================================================
    # NO MEALS
    # =====================================================

    if total_meals == 0:
        return

    # =====================================================
    # ALL MEALS COMPLETED
    # =====================================================

    if completed_meals == total_meals:

        create_notification(
            user=user,
            notification_type="diet",
            title="🍽️ Meals Completed",
            message=(
                "Excellent! You've completed all "
                "your scheduled meals for today."
            ),
        )

        return

    remaining = (
        total_meals - completed_meals
    )

    # =====================================================
    # MORNING
    # =====================================================

    if period == "morning":

        create_notification(
            user=user,
            notification_type="diet",
            title="🍳 Breakfast Reminder",
            message=(
                "Start your day with a balanced meal "
                "and remember to log your breakfast."
            ),
        )

        return

    # =====================================================
    # AFTERNOON
    # =====================================================

    if period == "afternoon":

        create_notification(
            user=user,
            notification_type="diet",
            title="🍽️ Meal Tracking Reminder",
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
            notification_type="diet",
            title="🍽️ Evening Meal Check",
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
            notification_type="diet",
            title="🍽️ Daily Nutrition Review",
            message=(
                f"You completed {completed_meals} "
                f"of {total_meals} scheduled meals today. "
                "Try to keep your meal tracking consistent."
            ),
        )


# =========================================================
# FITNESS GOAL
# =========================================================

def check_goal(user, period):

    if not user.goal:
        return

    if period != "morning":
        return

    goal = user.goal.lower()

    # =====================================================
    # WEIGHT LOSS
    # =====================================================

    if "lose" in goal:

        create_notification(
            user=user,
            notification_type="goal",
            title="🎯 Weight Loss Focus",
            message=(
                "Start your day focused on your goal. "
                "Stay consistent with your meals, "
                "hydration and workouts."
            ),
        )

    # =====================================================
    # MUSCLE GAIN
    # =====================================================

    elif "gain" in goal:

        create_notification(
            user=user,
            notification_type="goal",
            title="🎯 Muscle Gain Focus",
            message=(
                "Stay consistent with your workouts "
                "and nutrition to support your "
                "muscle-building goal."
            ),
        )

    # =====================================================
    # OTHER GOALS
    # =====================================================

    else:

        create_notification(
            user=user,
            notification_type="goal",
            title="🎯 Fitness Goal Focus",
            message=(
                "Stay consistent with your daily "
                "fitness habits and keep moving "
                "toward your goal."
            ),
        )


# =========================================================
# RUN ALL SMART CHECKS
# =========================================================

def generate_smart_notifications(user):
    """
    Run all time-aware FitFusion notification checks.

    Phase 5E.2:
        - Relevance
        - Cooldowns
        - Deduplication

    Phase 5E.3:
        - Priority
        - Intelligent notification filtering
    """

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