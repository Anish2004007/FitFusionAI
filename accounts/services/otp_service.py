import random
import time


class OTPService:

    @staticmethod
    def generate_otp():

        return str(random.randint(100000, 999999))

    @staticmethod
    def save_otp(request, email):

        otp = OTPService.generate_otp()

        request.session["otp"] = otp
        request.session["otp_email"] = email
        request.session["otp_time"] = int(time.time())

        return otp

    @staticmethod
    def verify_otp(request, entered_otp):

        saved_otp = request.session.get("otp")
        otp_time = request.session.get("otp_time")

        if not saved_otp or not otp_time:
            return False

        # OTP valid for 5 minutes
        if int(time.time()) - otp_time > 300:
            return False

        return entered_otp == saved_otp