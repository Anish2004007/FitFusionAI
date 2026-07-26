import random


class OTPService:

    @staticmethod
    def generate_otp():

        return str(random.randint(100000, 999999))