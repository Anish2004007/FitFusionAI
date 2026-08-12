from django.db import models


class Exercise(models.Model):

    CATEGORY_CHOICES = [
        ("Strength", "Strength"),
        ("Cardio", "Cardio"),
        ("Flexibility", "Flexibility"),
        ("Mobility", "Mobility"),
    ]

    DIFFICULTY_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    name = models.CharField(
        max_length=100
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )

    muscle_group = models.CharField(
        max_length=100
    )

    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES
    )

    description = models.TextField(
        blank=True
    )

    duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    calories_burned = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    equipment = models.CharField(
        max_length=100,
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

class WorkoutPlan(models.Model):

    GOAL_CHOICES = [
        ("Lose Weight", "Lose Weight"),
        ("Gain Muscle", "Gain Muscle"),
        ("Maintain Weight", "Maintain Weight"),
        ("Improve Fitness", "Improve Fitness"),
    ]

    DIFFICULTY_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    name = models.CharField(
        max_length=150
    )

    goal = models.CharField(
        max_length=30,
        choices=GOAL_CHOICES
    )

    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES
    )

    duration_minutes = models.PositiveIntegerField()

    description = models.TextField(
        blank=True
    )

    exercises = models.ManyToManyField(
        Exercise,
        related_name="workout_plans"
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.name