from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
from .models import User
from django.http import HttpResponse
from .forms import RegisterForm
from .services.otp_service import OTPService
from .services.email_service import EmailService




def home(request):
    return render(request, "home.html")


def register(request):

    if request.method == "POST":

        full_name = request.POST.get("full_name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        phone = request.POST.get("phone")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered.")
            return redirect("register")

        user = User(
            full_name=full_name,
            email=email,
            password=make_password(password),
            phone=phone,
            status="Active"
        )

        user.save()

        messages.success(request, "Registration successful.")
        return redirect("login")

    return render(request, "accounts/register.html")

def login_view(request):

    if request.method == "POST":

        email = request.POST.get("email")
        password = request.POST.get("password")

        try:
            user = User.objects.get(email=email)

            if check_password(password, user.password):

                request.session["user_id"] = user.user_id
                request.session["user_name"] = user.full_name

                return redirect("dashboard")

            else:
                messages.error(request, "Invalid password.")

        except User.DoesNotExist:
            messages.error(request, "Email not found.")

    return render(request, "accounts/login.html")

def logout_view(request):

    request.session.flush()

    return redirect("login")