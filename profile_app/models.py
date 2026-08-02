from django.db import models
from accounts.models import User


class UserProfile(models.Model):

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    GOAL_CHOICES = [
        ('Lose Weight', 'Lose Weight'),
        ('Gain Muscle', 'Gain Muscle'),
        ('Maintain Weight', 'Maintain Weight'),
        ('Improve Fitness', 'Improve Fitness'),
    ]

    ACTIVITY_CHOICES = [
        ('Sedentary', 'Sedentary'),
        ('Lightly Active', 'Lightly Active'),
        ('Moderately Active', 'Moderately Active'),
        ('Very Active', 'Very Active'),
        ('Athlete', 'Athlete'),
    ]

    DIET_CHOICES = [
        ('Vegetarian', 'Vegetarian'),
        ('Eggetarian', 'Eggetarian'),
        ('Non-Vegetarian', 'Non-Vegetarian'),
        ('Vegan', 'Vegan'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    

    date_of_birth = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    height = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    target_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    fitness_goal = models.CharField(
        max_length=30,
        choices=GOAL_CHOICES
    )

    activity_level = models.CharField(
        max_length=30,
        choices=ACTIVITY_CHOICES
    )

    diet_preference = models.CharField(
        max_length=30,
        choices=DIET_CHOICES
    )

    medical_conditions = models.TextField(
        blank=True
    )

    allergies = models.TextField(
        blank=True
    )

    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )

    profile_completed = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.full_name