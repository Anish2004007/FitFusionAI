from django.db import models
from accounts.models import User


class Notification(models.Model):

    TYPE_CHOICES = [
        ("hydration", "Hydration"),
        ("workout", "Workout"),
        ("diet", "Diet"),
        ("goal", "Goal"),
        ("ai", "AI Coach"),
        ("system", "System"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_column="user_id",
    )

    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default="system",
    )

    title = models.CharField(
        max_length=150
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.user.full_name} - "
            f"{self.title}"
        )