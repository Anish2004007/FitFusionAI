from django.db import models
from accounts.models import User


class WaterIntake(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="water_intakes"
    )

    amount = models.PositiveIntegerField(
        help_text="Amount of water consumed in milliliters."
    )

    consumed_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "water_intake"
        ordering = ["-consumed_at"]

    def __str__(self):
        return f"{self.user.full_name} - {self.amount} ml"