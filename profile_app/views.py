from django.shortcuts import render, redirect
from accounts.models import User
from .forms import UserProfileForm
from .models import UserProfile


def profile_setup(request):

    # Check if user is logged in
    user_id = request.session.get("user_id")

    if not user_id:
        return redirect("login")

    # Get logged-in user
    user = User.objects.get(user_id=user_id)

    # Check if profile already exists
    try:
        profile = UserProfile.objects.get(user=user)

    except UserProfile.DoesNotExist:
        profile = None

    if request.method == "POST":

        if profile:
            form = UserProfileForm(
                request.POST,
                request.FILES,
                instance=profile
            )
        else:
            form = UserProfileForm(
                request.POST,
                request.FILES
            )

        if form.is_valid():

            profile = form.save(commit=False)

            profile.user = user

            profile.profile_completed = True

            profile.save()

            return redirect("dashboard")

    else:

        if profile:
            form = UserProfileForm(instance=profile)
        else:
            form = UserProfileForm()

    return render(
    request,
    "profile_app/profile_setup.html",
    {
        "form": form,
        "user": user,
    },
)