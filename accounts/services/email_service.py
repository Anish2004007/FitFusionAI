from django.core.mail import EmailMultiAlternatives
from django.conf import settings


class EmailService:

    @staticmethod
    def send_otp(email, otp):

        subject = "FitFusion AI - Email Verification"

        text = f"""

Your OTP is

{otp}

Valid for 5 minutes.

"""

        html = f"""
<html>

<body
style="font-family:Arial;
background:#f7f7f7;
padding:40px;">

<div
style="
max-width:600px;
background:white;
margin:auto;
padding:40px;
border-radius:12px;">

<h2
style="color:#0D6EFD;">

FitFusion AI

</h2>

<hr>

<h3>

Email Verification

</h3>

<p>

Your verification code is

</p>

<h1
style="
letter-spacing:6px;
color:#20C997;">

{otp}

</h1>

<p>

This OTP expires in

<b>

5 Minutes

</b>

</p>

</div>

</body>

</html>
"""

        mail = EmailMultiAlternatives(
            subject,
            text,
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )

        mail.attach_alternative(html, "text/html")

        mail.send()