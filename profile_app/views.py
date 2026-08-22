import json
from django.shortcuts import render, redirect
from accounts.models import User
from .forms import UserProfileForm
from .models import UserProfile
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt

def profile_setup(request):

    # Check if user is logged in
    user_id = request.session.get("user_id")

    if not user_id:
        return redirect("login")

    # Get logged-in user
    user = User.objects.get(user_id=user_id)
    print("PROFILE:", user.user_id, user.full_name, user.email)
    # Check if profile already exists
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

def profile_api(request):
    """
    Return the currently logged-in user's
    User + UserProfile information.
    """

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
                    "date_of_birth": (
                        profile.date_of_birth.isoformat()
                        if profile.date_of_birth
                        else None
                    ),

                    "gender": profile.gender,

                    "height": (
                        float(profile.height)
                        if profile.height is not None
                        else None
                    ),

                    "weight": (
                        float(profile.weight)
                        if profile.weight is not None
                        else None
                    ),

                    "target_weight": (
                        float(profile.target_weight)
                        if profile.target_weight is not None
                        else None
                    ),

                    "fitness_goal": profile.fitness_goal,

                    "activity_level":
                        profile.activity_level,

                    "diet_preference":
                        profile.diet_preference,

                    "medical_conditions":
                        profile.medical_conditions,

                    "allergies":
                        profile.allergies,

                    "profile_picture": (
                        profile.profile_picture.url
                        if profile.profile_picture
                        else None
                    ),

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


@csrf_exempt
@require_http_methods(["PUT"])
def update_profile_api(request):
    """
    Update the currently logged-in user's
    User and UserProfile information.
    """

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

        # =====================================
        # READ JSON
        # =====================================

        import json

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

        # =====================================
        # USER INFORMATION
        # =====================================

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
            user.phone = (
                str(data.get("phone") or "").strip()
            )

        # =====================================
        # PROFILE INFORMATION
        # =====================================

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

                profile.date_of_birth = (
                    parsed_date
                )

        if "gender" in data:
            profile.gender = (
                data.get("gender") or ""
            )

        if "height" in data:

            try:
                profile.height = data.get(
                    "height"
                )
            except (TypeError, ValueError):

                return JsonResponse(
                    {
                        "success": False,
                        "error": "Invalid height."
                    },
                    status=400
                )

        if "weight" in data:

            try:
                profile.weight = data.get(
                    "weight"
                )
            except (TypeError, ValueError):

                return JsonResponse(
                    {
                        "success": False,
                        "error": "Invalid weight."
                    },
                    status=400
                )

        if "target_weight" in data:

            try:
                profile.target_weight = data.get(
                    "target_weight"
                )
            except (TypeError, ValueError):

                return JsonResponse(
                    {
                        "success": False,
                        "error":
                            "Invalid target weight."
                    },
                    status=400
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
            profile.medical_conditions = (
                str(
                    data.get(
                        "medical_conditions"
                    ) or ""
                ).strip()
            )

        if "allergies" in data:
            profile.allergies = (
                str(
                    data.get("allergies")
                    or ""
                ).strip()
            )

        # =====================================
        # SAVE USER
        # =====================================

        from django.utils import timezone

        user.updated_at = timezone.now()

        user.save()

        # =====================================
        # SAVE PROFILE
        # =====================================

        profile.profile_completed = True

        profile.save()

        # =====================================
        # UPDATE SESSION NAME
        # =====================================

        request.session["user_name"] = (
            user.full_name
        )

        request.session.save()

        # =====================================
        # SUCCESS
        # =====================================

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