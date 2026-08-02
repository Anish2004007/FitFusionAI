from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
from .models import User
from django.http import HttpResponse
from .forms import RegisterForm
from .services.otp_service import OTPService
from .services.email_service import EmailService
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


def home(request):
    return render(request, "home.html")


def register(request):

    if request.method == "POST":

        full_name = request.POST.get("full_name")
        email = request.POST.get("email", "").strip().lower()
        password = request.POST.get("password")
        phone = request.POST.get("phone")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered.")
            return redirect("register")

        # Store registration data in session
        request.session["register_data"] = {
            "full_name": full_name,
            "email": email,
            "password": make_password(password),
            "phone": phone
        }

        # Generate OTP
        otp = OTPService.save_otp(request, email)

        print("=" * 50)
        print("Email:", email)
        print("Generated OTP:", otp)

        try:
            EmailService.send_otp(
    email=email,
    otp=otp,
    template_name="emails/otp_email.html",
    subject="Verify Your Email • FitFusion AI"
)
            print("✅ OTP Email Sent Successfully")

        except Exception as e:
            print("❌ Email Error:", e)
            messages.error(request, f"Email Error: {e}")
            return redirect("register")

        print("=" * 50)

        messages.success(request, "OTP sent to your email.")

        return redirect("verify_otp")

    return render(request, "accounts/register.html")
def verify_otp(request):

    if request.method == "POST":

        entered_otp = request.POST.get("otp")

        if OTPService.verify_otp(request, entered_otp):

            data = request.session.get("register_data")

            User.objects.create(

                full_name=data["full_name"],

                email=data["email"],

                password=data["password"],

                phone=data["phone"],

                created_at=timezone.now(),

                updated_at=timezone.now(),

                status="Active"

            )

            # Remove session data
            request.session.pop("otp", None)
            request.session.pop("otp_email", None)
            request.session.pop("otp_time", None)
            request.session.pop("register_data", None)

            messages.success(request, "Account verified successfully.")

            return redirect("login")

        else:

            messages.error(request, "Invalid or expired OTP.")

    return render(request, "accounts/verify_otp.html")

def login_view(request):

    if request.method == "POST":

        email = request.POST.get("email", "").strip().lower()
        password = request.POST.get("password")

        try:
            user = User.objects.get(email=email)

            if check_password(password, user.password):

                # Save user session
                request.session["user_id"] = user.user_id
                request.session["user_name"] = user.full_name

                print("LOGIN:", user.user_id, user.full_name, user.email)
            
                from profile_app.models import UserProfile

                # Check if profile already exists
                if UserProfile.objects.filter(user=user).exists():
                    return redirect("dashboard")
                else:
                    return redirect("profile_setup")

            else:
                messages.error(request, "Invalid password.")

        except User.DoesNotExist:
            messages.error(request, "Email not found.")

    return render(request, "accounts/login.html")

def logout_view(request):

    request.session.flush()

    return redirect("login")

def test_email(request):

    send_mail(
        subject="FitFusion AI Test Email",
        message="Congratulations! Your email configuration is working successfully.",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=["gholapvijay64@gmail.com"],
        fail_silently=False,
    )

    return HttpResponse("Email sent successfully!")

def resend_otp(request):

    return redirect("verify_otp")

def forgot_password(request):

    if request.method == "POST":

        email = request.POST.get("email", "").strip().lower()

        try:
            user = User.objects.get(email=email)

            # Save email in session
            request.session["reset_email"] = email

            # Generate OTP
            otp = OTPService.save_otp(request, email)

            # Send Beautiful OTP Email
            EmailService.send_otp(
    email=email,
    otp=otp,
    template_name="emails/forgot_password_email.html",
    subject="Reset Your Password • FitFusion AI"
)

            messages.success(request, "OTP sent to your email.")

            return redirect("verify_reset_otp")

        except User.DoesNotExist:

            messages.error(request, "Email is not registered.")

    return render(request, "accounts/forgot_password.html")

def reset_password(request):

    email = request.session.get("reset_email")

    if not email:

        messages.error(request, "Session Expired.")

        return redirect("forgot_password")

    if request.method == "POST":

        password = request.POST.get("password")

        confirm_password = request.POST.get("confirm_password")

        if password != confirm_password:

            messages.error(request, "Passwords do not match.")

            return redirect("reset_password")

        user = User.objects.get(email=email)

        user.password = make_password(password)

        user.save()

        request.session.pop("reset_email", None)
        request.session.pop("otp", None)
        request.session.pop("otp_email", None)
        request.session.pop("otp_time", None)

        messages.success(request, "Password updated successfully.")

        return redirect("login")

    return render(request, "accounts/reset_password.html")

def verify_reset_otp(request):

    if request.method == "POST":

        entered_otp = request.POST.get("otp")

        if OTPService.verify_otp(request, entered_otp):

            messages.success(request, "OTP Verified Successfully.")

            return redirect("reset_password")

        else:

            messages.error(request, "Invalid or Expired OTP.")

    return render(request, "accounts/verify_reset_otp.html")