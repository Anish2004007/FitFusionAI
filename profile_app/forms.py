from django import forms
from .models import UserProfile


class UserProfileForm(forms.ModelForm):

    class Meta:
        model = UserProfile

        exclude = (
            "user",
            "profile_completed",
            "created_at",
            "updated_at",
        )

        widgets = {

            "date_of_birth": forms.DateInput(
                attrs={"type": "date"}
            ),

        }