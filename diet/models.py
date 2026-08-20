from django.db import models
from accounts.models import User


class Food(models.Model):

    CATEGORY_CHOICES = [
        ("Protein", "Protein"),
        ("Carbohydrate", "Carbohydrate"),
        ("Healthy Fat", "Healthy Fat"),
        ("Fruit", "Fruit"),
        ("Vegetable", "Vegetable"),
        ("Dairy", "Dairy"),
        ("Snack", "Snack"),
    ]

    name = models.CharField(
        max_length=150
    )

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES
    )

    calories = models.PositiveIntegerField()

    protein = models.FloatField(
        default=0
    )

    carbohydrates = models.FloatField(
        default=0
    )

    fats = models.FloatField(
        default=0
    )

    serving_size = models.CharField(
        max_length=100
    )

    description = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.name


class DietPlan(models.Model):

    GOAL_CHOICES = [
        ("Lose Weight", "Lose Weight"),
        ("Gain Muscle", "Gain Muscle"),
        ("Maintain Weight", "Maintain Weight"),
        ("Improve Fitness", "Improve Fitness"),
    ]

    MEAL_CHOICES = [
        ("Breakfast", "Breakfast"),
        ("Lunch", "Lunch"),
        ("Dinner", "Dinner"),
        ("Snack", "Snack"),
    ]

    name = models.CharField(
        max_length=150
    )

    goal = models.CharField(
        max_length=30,
        choices=GOAL_CHOICES
    )

    meal_type = models.CharField(
        max_length=20,
        choices=MEAL_CHOICES
    )

    description = models.TextField(
        blank=True
    )

    foods = models.ManyToManyField(
        Food,
        related_name="diet_plans"
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.name} - {self.meal_type}"


class DietDay(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="diet_days"
    )

    date = models.DateField()

    calorie_target = models.PositiveIntegerField()

    completed = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        unique_together = (
            "user",
            "date",
        )

        ordering = [
            "-date"
        ]

    def __str__(self):

        return (
            f"{self.user.full_name} - "
            f"{self.date}"
        )


class DietMeal(models.Model):

    diet_day = models.ForeignKey(
        DietDay,
        on_delete=models.CASCADE,
        related_name="meals"
    )

    diet_plan = models.ForeignKey(
        DietPlan,
        on_delete=models.CASCADE,
        related_name="scheduled_meals"
    )

    completed = models.BooleanField(
        default=False
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):

        return (
            f"{self.diet_day} - "
            f"{self.diet_plan.name}"
        )