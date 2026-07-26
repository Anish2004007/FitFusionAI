from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def send_test_email(receiver_email):

    subject = "Welcome to FitFusion AI"

    text_content = """
Hello,

This is a test email from FitFusion AI.

Your email configuration is working successfully.

Thank you.
FitFusion AI Team
"""

    html_content = f"""
    <html>
    <body style="font-family:Arial;background:#f5f5f5;padding:30px;">

        <div style="max-width:600px;margin:auto;background:white;
        border-radius:10px;padding:30px;">

            <h2 style="color:#0d6efd;">
                FitFusion AI
            </h2>

            <hr>

            <h3>Hello 👋</h3>

            <p>

                This is a test email from
                <b>FitFusion AI</b>.

            </p>

            <p>

                Your email configuration is
                working successfully.

            </p>

            <br>

            <p>

                Thank you,<br>

                <b>FitFusion AI Team</b>

            </p>

        </div>

    </body>
    </html>
    """

    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [receiver_email]
    )

    email.attach_alternative(html_content, "text/html")

    email.send()