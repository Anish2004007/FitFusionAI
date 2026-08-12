from django.contrib import admin

from .models import Exercise, WorkoutPlan


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "category",
        "muscle_group",
        "difficulty",
        "duration_minutes",
        "calories_burned",
        "is_active",
    )

    list_filter = (
        "category",
        "difficulty",
        "is_active",
    )

    search_fields = (
        "name",
        "muscle_group",
    )


@admin.register(WorkoutPlan)
class WorkoutPlanAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "goal",
        "difficulty",
        "duration_minutes",
        "is_active",
    )

    list_filter = (
        "goal",
        "difficulty",
        "is_active",
    )

    search_fields = (
        "name",
    )