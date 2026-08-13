from django.db import models
from accounts.models import User

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

class WorkoutSession(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="workout_sessions"
    )

    workout_plan = models.ForeignKey(
        WorkoutPlan,
        on_delete=models.CASCADE,
        related_name="sessions"
    )

    started_at = models.DateTimeField(
        auto_now_add=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed = models.BooleanField(
        default=False
    )

    def __str__(self):

        return f"{self.user.full_name} - {self.workout_plan.name}"

class WorkoutExercise(models.Model):

    workout_session = models.ForeignKey(
        WorkoutSession,
        on_delete=models.CASCADE,
        related_name="exercise_progress"
    )

    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.CASCADE,
        related_name="session_records"
    )

    completed = models.BooleanField(
        default=False
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):

        return f"{self.workout_session} - {self.exercise.name}"