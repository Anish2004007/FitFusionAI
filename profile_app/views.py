import json

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_date
from django.utils import timezone
from django.core.files.storage import default_storage

from PIL import Image

from accounts.models import User
from .forms import UserProfileForm
from .models import UserProfile


# =========================================================
# PROFILE SETUP
# =========================================================

def profile_setup(request):

    user_id = request.session.get("user_id")

    if not user_id:
        return redirect("login")

    user = User.objects.get(user_id=user_id)

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


# =========================================================
# GET PROFILE API
# =========================================================

@require_http_methods(["GET"])
def profile_api(request):

    user_id = request.session.get("user_id")

    if not user_id:
        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in."
            },
            status=401
        )

    try:

        user = User.objects.get(
            user_id=user_id
        )

        profile = UserProfile.objects.filter(
            user=user
        ).first()

        if not profile:
            return JsonResponse(
                {
                    "success": False,
                    "error": "Profile not found."
                },
                status=404
            )

        # =================================================
        # PROFILE IMAGE URL
        # =================================================

        profile_picture = None

        if profile.profile_picture:

            try:
                profile_picture = request.build_absolute_uri(
                    profile.profile_picture.url
                )
            except Exception:
                profile_picture = None

        # =================================================
        # RESPONSE
        # =================================================

        return JsonResponse(
            {
                "success": True,

                "user": {
                    "user_id": user.user_id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                },

                "profile": {

                    "date_of_birth":
                        profile.date_of_birth.isoformat()
                        if profile.date_of_birth
                        else None,

                    "gender":
                        profile.gender,

                    "height":
                        float(profile.height)
                        if profile.height is not None
                        else None,

                    "weight":
                        float(profile.weight)
                        if profile.weight is not None
                        else None,

                    "target_weight":
                        float(profile.target_weight)
                        if profile.target_weight is not None
                        else None,

                    "fitness_goal":
                        profile.fitness_goal,

                    "activity_level":
                        profile.activity_level,

                    "diet_preference":
                        profile.diet_preference,

                    "medical_conditions":
                        profile.medical_conditions,

                    "allergies":
                        profile.allergies,

                    "profile_picture":
                        profile_picture,

                    "profile_completed":
                        profile.profile_completed,
                }
            }
        )

    except User.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "User not found."
            },
            status=404
        )

    except Exception as error:

        print(
            "PROFILE API ERROR:",
            error
        )

        return JsonResponse(
            {
                "success": False,
                "error": "Unable to load profile."
            },
            status=500
        )


# =========================================================
# UPDATE PROFILE API
# =========================================================

@csrf_exempt
@require_http_methods(["PUT"])
def update_profile_api(request):

    user_id = request.session.get("user_id")

    if not user_id:
        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in."
            },
            status=401
        )

    try:

        user = User.objects.get(
            user_id=user_id
        )

        profile = UserProfile.objects.filter(
            user=user
        ).first()

        if not profile:
            return JsonResponse(
                {
                    "success": False,
                    "error": "Profile not found."
                },
                status=404
            )

        # =================================================
        # READ JSON
        # =================================================

        try:

            data = json.loads(
                request.body
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "success": False,
                    "error": "Invalid JSON data."
                },
                status=400
            )

        # =================================================
        # USER INFORMATION
        # =================================================

        full_name = data.get("full_name")

        if full_name is not None:

            full_name = str(
                full_name
            ).strip()

            if not full_name:

                return JsonResponse(
                    {
                        "success": False,
                        "error":
                            "Full name cannot be empty."
                    },
                    status=400
                )

            user.full_name = full_name

        if "phone" in data:

            user.phone = str(
                data.get("phone") or ""
            ).strip()

        # =================================================
        # PROFILE INFORMATION
        # =================================================

        if "date_of_birth" in data:

            value = data.get(
                "date_of_birth"
            )

            if value:

                parsed_date = parse_date(
                    value
                )

                if not parsed_date:

                    return JsonResponse(
                        {
                            "success": False,
                            "error":
                                "Invalid date of birth."
                        },
                        status=400
                    )

                profile.date_of_birth = parsed_date

        if "gender" in data:

            profile.gender = (
                data.get("gender") or ""
            )

        if "height" in data:

            profile.height = data.get(
                "height"
            )

        if "weight" in data:

            profile.weight = data.get(
                "weight"
            )

        if "target_weight" in data:

            profile.target_weight = data.get(
                "target_weight"
            )

        if "fitness_goal" in data:

            profile.fitness_goal = (
                data.get("fitness_goal") or ""
            )

        if "activity_level" in data:

            profile.activity_level = (
                data.get("activity_level") or ""
            )

        if "diet_preference" in data:

            profile.diet_preference = (
                data.get("diet_preference") or ""
            )

        if "medical_conditions" in data:

            profile.medical_conditions = str(
                data.get(
                    "medical_conditions"
                ) or ""
            ).strip()

        if "allergies" in data:

            profile.allergies = str(
                data.get(
                    "allergies"
                ) or ""
            ).strip()

        # =================================================
        # SAVE
        # =================================================

        user.updated_at = timezone.now()
        user.save()

        profile.profile_completed = True
        profile.save()

        # =================================================
        # UPDATE SESSION
        # =================================================

        request.session["user_name"] = (
            user.full_name
        )

        request.session.save()

        return JsonResponse(
            {
                "success": True,
                "message":
                    "Profile updated successfully."
            }
        )

    except User.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "User not found."
            },
            status=404
        )

    except Exception as error:

        print(
            "PROFILE UPDATE ERROR:",
            error
        )

        return JsonResponse(
            {
                "success": False,
                "error":
                    "Unable to update profile."
            },
            status=500
        )


# =========================================================
# UPLOAD PROFILE PICTURE
# =========================================================

@csrf_exempt
@require_http_methods(["POST"])
def upload_profile_picture(request):

    user_id = request.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in."
            },
            status=401
        )

    try:

        user = User.objects.get(
            user_id=user_id
        )

        profile = UserProfile.objects.filter(
            user=user
        ).first()

        if not profile:

            return JsonResponse(
                {
                    "success": False,
                    "error": "Profile not found."
                },
                status=404
            )

        uploaded_file = request.FILES.get(
            "profile_picture"
        )

        if not uploaded_file:

            return JsonResponse(
                {
                    "success": False,
                    "error":
                        "Please select an image."
                },
                status=400
            )

        # =================================================
        # FILE SIZE
        # =================================================

        max_size = 5 * 1024 * 1024

        if uploaded_file.size > max_size:

            return JsonResponse(
                {
                    "success": False,
                    "error":
                        "Image size must be less than 5 MB."
                },
                status=400
            )

        # =================================================
        # VALIDATE IMAGE
        # =================================================

        try:

            image = Image.open(
                uploaded_file
            )

            image.verify()

        except Exception:

            return JsonResponse(
                {
                    "success": False,
                    "error":
                        "Invalid image file."
                },
                status=400
            )

        # =================================================
        # VALIDATE FORMAT
        # =================================================

        image_format = (
            image.format
            if image
            else None
        )

        allowed_formats = {
            "JPEG",
            "PNG",
            "WEBP",
        }

        if image_format not in allowed_formats:

            return JsonResponse(
                {
                    "success": False,
                    "error":
                        "Only JPG, PNG and WEBP images are allowed."
                },
                status=400
            )

        # =================================================
        # RESET FILE POINTER
        # =================================================

        uploaded_file.seek(0)

        # =================================================
        # DELETE OLD IMAGE
        # =================================================

        old_picture = profile.profile_picture

        if old_picture:

            try:

                old_picture.delete(
                    save=False
                )

            except Exception as error:

                print(
                    "OLD PROFILE IMAGE DELETE WARNING:",
                    error
                )

        # =================================================
        # SAVE NEW IMAGE
        # =================================================

        profile.profile_picture = uploaded_file

        profile.save(
            update_fields=[
                "profile_picture",
                "updated_at",
            ]
        )

        # =================================================
        # IMAGE URL
        # =================================================

        image_url = request.build_absolute_uri(
            profile.profile_picture.url
        )

        return JsonResponse(
            {
                "success": True,
                "message":
                    "Profile picture updated successfully.",
                "profile_picture":
                    image_url,
            }
        )

    except User.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "User not found."
            },
            status=404
        )

    except Exception as error:

        print(
            "PROFILE PICTURE UPLOAD ERROR:",
            error
        )

        return JsonResponse(
            {
                "success": False,
                "error":
                    "Unable to upload profile picture."
            },
            status=500
        )


# =========================================================
# REMOVE PROFILE PICTURE
# =========================================================

@csrf_exempt
@require_http_methods(["DELETE"])
def remove_profile_picture(request):

    user_id = request.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "success": False,
                "error": "User is not logged in."
            },
            status=401
        )

    try:

        user = User.objects.get(
            user_id=user_id
        )

        profile = UserProfile.objects.filter(
            user=user
        ).first()

        if not profile:

            return JsonResponse(
                {
                    "success": False,
                    "error": "Profile not found."
                },
                status=404
            )

        # =================================================
        # REMEMBER OLD FILE
        # =================================================

        old_file_name = None

        if profile.profile_picture:

            old_file_name = (
                profile.profile_picture.name
            )

        # =================================================
        # IMPORTANT:
        # CLEAR DATABASE FIELD FIRST
        # =================================================

        profile.profile_picture = None

        profile.save(
            update_fields=[
                "profile_picture",
                "updated_at",
            ]
        )

        # =================================================
        # DELETE PHYSICAL FILE
        # =================================================
        #
        # This is intentionally done AFTER the database
        # field has been cleared.
        #
        # Even if the physical file is already missing,
        # the profile will still successfully have no
        # profile picture.
        #

        if old_file_name:

            try:

                if default_storage.exists(
                    old_file_name
                ):

                    default_storage.delete(
                        old_file_name
                    )

            except Exception as error:

                # Do not fail the API just because the
                # physical file could not be deleted.
                print(
                    "PROFILE IMAGE FILE DELETE WARNING:",
                    error
                )

        # =================================================
        # SUCCESS
        # =================================================

        return JsonResponse(
            {
                "success": True,
                "message":
                    "Profile picture removed successfully.",
                "profile_picture": None,
            }
        )

    except User.DoesNotExist:

        return JsonResponse(
            {
                "success": False,
                "error": "User not found."
            },
            status=404
        )

    except Exception as error:

        print(
            "PROFILE PICTURE REMOVE ERROR:",
            error
        )

        return JsonResponse(
            {
                "success": False,
                "error":
                    "Unable to remove profile picture."
            },
            status=500
        )