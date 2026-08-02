from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):

    list_display = (
        'user',
        'fitness_goal',
        'activity_level',
        'profile_completed',
    )

    search_fields = (
        'user__username',
        'full_name',
    )

    list_filter = (
        'fitness_goal',
        'diet_preference',
        'profile_completed',
    )