from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


class EmailService:

    @staticmethod
    def send_otp(email, otp, template_name, subject):
        logo_url = "https://res.cloudinary.com/y1ywf71z/image/upload/f_auto,q_auto/email_logo1_opscaa"

        html = render_to_string(
    template_name,
    {
        "otp": otp,
        "logo_url": logo_url,
    }
)

        message = EmailMultiAlternatives(
            subject=subject,
            body=f"Your OTP is {otp}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )

        message.attach_alternative(html, "text/html")

        message.send()