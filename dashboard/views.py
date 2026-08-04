from django.shortcuts import render, redirect
from accounts.models import User


def dashboard(request):

    user_id = request.session.get("user_id")

    if not user_id:

        return redirect("login")

    user = User.objects.get(user_id=user_id)

    return render(
        request,
        "dashboard/dashboard.html",
        {
            "user": user
        }
    )