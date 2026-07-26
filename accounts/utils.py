from django.utils import timezone


def otp_expiry_time():

    return timezone.now()