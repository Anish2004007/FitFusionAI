import { useEffect, useState } from "react";

import {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    removeProfilePicture,
} from "../services/api";

function Profile({ onUserLoaded }) {

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editing, setEditing] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        height: "",
        weight: "",
        target_weight: "",
        fitness_goal: "",
        activity_level: "",
        diet_preference: "",
        medical_conditions: "",
        allergies: "",
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [showImageActions, setShowImageActions] = useState(false);


    /* =========================================
       LOAD PROFILE
    ========================================= */

    const loadProfile = async () => {

        try {

            const data = await getProfile();

            if (!data.success) {

                setError(
                    data.error ||
                    "Unable to load profile."
                );

                return;
            }

            setUser(data.user);
            setProfile(data.profile);

            /*
             * IMPORTANT:
             * profile_picture is returned inside
             * data.profile, not data.user.
             *
             * Pass it to the parent so the navbar
             * can display the same profile picture.
             */
            if (
                onUserLoaded &&
                data.user
            ) {
                onUserLoaded({
                    ...data.user,
                    profile_picture:
                        data.profile?.profile_picture || null,
                });
            }

            setForm({
                full_name:
                    data.user?.full_name || "",

                phone:
                    data.user?.phone || "",

                date_of_birth:
                    data.profile?.date_of_birth || "",

                gender:
                    data.profile?.gender || "",

                height:
                    data.profile?.height ?? "",

                weight:
                    data.profile?.weight ?? "",

                target_weight:
                    data.profile?.target_weight ?? "",

                fitness_goal:
                    data.profile?.fitness_goal || "",

                activity_level:
                    data.profile?.activity_level || "",

                diet_preference:
                    data.profile?.diet_preference || "",

                medical_conditions:
                    data.profile?.medical_conditions || "",

                allergies:
                    data.profile?.allergies || "",
            });

        } catch (err) {

            console.error(
                "PROFILE LOAD ERROR:",
                err
            );

            setError(
                "Unable to connect to Django."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadProfile();

    }, []);


    /* =========================================
       INPUT CHANGE
    ========================================= */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /* =========================================
       SAVE
    ========================================= */

    const handleSave = async () => {

        setSaving(true);
        setError("");
        setMessage("");

        try {

            const data =
                await updateProfile(form);

            if (!data.success) {

                setError(
                    data.error ||
                    "Unable to update profile."
                );

                return;
            }


            /*
             * Immediately update the local
             * profile data using the values
             * that were just saved.
             */

            const updatedUser = {
                ...user,
                full_name: form.full_name,
                phone: form.phone,

                /*
                 * Preserve the current profile
                 * picture while updating other
                 * user information.
                 */
                profile_picture:
                    profile?.profile_picture || null,
            };


            const updatedProfile = {
                ...profile,

                date_of_birth:
                    form.date_of_birth,

                gender:
                    form.gender,

                height:
                    form.height,

                weight:
                    form.weight,

                target_weight:
                    form.target_weight,

                fitness_goal:
                    form.fitness_goal,

                activity_level:
                    form.activity_level,

                diet_preference:
                    form.diet_preference,

                medical_conditions:
                    form.medical_conditions,

                allergies:
                    form.allergies,

                profile_completed: true,
            };


            setUser(updatedUser);
            setProfile(updatedProfile);


            if (
                onUserLoaded
            ) {
                onUserLoaded(
                    updatedUser
                );
            }


            setEditing(false);

            setMessage(
                "Profile updated successfully."
            );


            /*
             * Fetch the real saved values from
             * Django after updating the screen.
             */

            const refreshed =
                await getProfile();


            if (
                refreshed.success
            ) {

                setUser(
                    refreshed.user
                );

                setProfile(
                    refreshed.profile
                );


                setForm({

                    full_name:
                        refreshed.user?.full_name || "",

                    phone:
                        refreshed.user?.phone || "",

                    date_of_birth:
                        refreshed.profile?.date_of_birth || "",

                    gender:
                        refreshed.profile?.gender || "",

                    height:
                        refreshed.profile?.height ?? "",

                    weight:
                        refreshed.profile?.weight ?? "",

                    target_weight:
                        refreshed.profile?.target_weight ?? "",

                    fitness_goal:
                        refreshed.profile?.fitness_goal || "",

                    activity_level:
                        refreshed.profile?.activity_level || "",

                    diet_preference:
                        refreshed.profile?.diet_preference || "",

                    medical_conditions:
                        refreshed.profile?.medical_conditions || "",

                    allergies:
                        refreshed.profile?.allergies || "",
                });


                /*
                 * Keep navbar synchronized with
                 * the latest Django profile data.
                 */
                if (
                    onUserLoaded &&
                    refreshed.user
                ) {
                    onUserLoaded({
                        ...refreshed.user,
                        profile_picture:
                            refreshed.profile?.profile_picture ||
                            null,
                    });
                }

            }


        } catch (err) {

            console.error(
                "PROFILE UPDATE ERROR:",
                err
            );

            setError(
                "Unable to update profile."
            );

        } finally {

            setSaving(false);

        }
    };


    /* =========================================
       CANCEL
    ========================================= */

    const handleCancel = () => {

        if (!user || !profile) {
            return;
        }

        setForm({

            full_name:
                user.full_name || "",

            phone:
                user.phone || "",

            date_of_birth:
                profile.date_of_birth || "",

            gender:
                profile.gender || "",

            height:
                profile.height ?? "",

            weight:
                profile.weight ?? "",

            target_weight:
                profile.target_weight ?? "",

            fitness_goal:
                profile.fitness_goal || "",

            activity_level:
                profile.activity_level || "",

            diet_preference:
                profile.diet_preference || "",

            medical_conditions:
                profile.medical_conditions || "",

            allergies:
                profile.allergies || "",
        });

        setEditing(false);
        setError("");
        setMessage("");
    };


    /* =========================================
       PROFILE PICTURE
    ========================================= */

    const handleImageSelect = (event) => {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setMessage("");

        // 5 MB limit
        if (file.size > 5 * 1024 * 1024) {

            setError(
                "Image size must be less than 5 MB."
            );

            event.target.value = "";
            return;
        }

        // File type validation
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {

            setError(
                "Only JPG, PNG and WEBP images are allowed."
            );

            event.target.value = "";
            return;
        }

        setSelectedImage(file);

        const previewUrl =
            URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };


    const handleUploadImage = async () => {

        if (!selectedImage) {
            return;
        }

        setUploadingImage(true);
        setError("");
        setMessage("");

        try {

            const data =
                await uploadProfilePicture(
                    selectedImage
                );

            if (!data.success) {

                setError(
                    data.error ||
                    "Unable to upload profile picture."
                );

                return;
            }

            const newImageUrl =
                data.profile_picture;


            /*
             * Update profile page immediately.
             */
            setProfile((previous) => ({
                ...previous,
                profile_picture: newImageUrl,
            }));


            setSelectedImage(null);
            setImagePreview(null);
            setShowImageActions(false);


            setMessage(
                "Profile picture updated successfully."
            );


            /*
             * IMPORTANT:
             * Send the new profile picture to
             * the parent so the navbar updates
             * immediately.
             */
            if (
                onUserLoaded &&
                user
            ) {

                onUserLoaded({
                    ...user,
                    profile_picture:
                        newImageUrl,
                });

            }

        } catch (err) {

            console.error(
                "PROFILE PICTURE UPLOAD ERROR:",
                err
            );

            setError(
                err.response?.data?.error ||
                "Unable to upload profile picture."
            );

        } finally {

            setUploadingImage(false);

        }
    };


    const handleRemoveImage = async () => {

        if (uploadingImage) {
            return;
        }

        setUploadingImage(true);
        setError("");
        setMessage("");

        try {

            const data =
                await removeProfilePicture();

            if (!data.success) {

                setError(
                    data.error ||
                    "Unable to remove profile picture."
                );

                return;
            }


            /*
             * Immediately remove the picture
             * from the Profile page.
             */
            setProfile((previous) => {

                if (!previous) {
                    return previous;
                }

                return {
                    ...previous,
                    profile_picture: null,
                };
            });


            setSelectedImage(null);
            setImagePreview(null);
            setShowImageActions(false);


            setMessage(
                "Profile picture removed successfully."
            );


            /*
             * IMPORTANT:
             * Immediately remove the picture
             * from the navbar as well.
             */
            if (
                onUserLoaded &&
                user
            ) {

                onUserLoaded({
                    ...user,
                    profile_picture: null,
                });

            }


            /*
             * Refresh from Django so the frontend
             * and database are guaranteed to be
             * synchronized.
             */
            try {

                const refreshed =
                    await getProfile();

                if (
                    refreshed.success
                ) {

                    setUser(
                        refreshed.user
                    );

                    setProfile(
                        refreshed.profile
                    );


                    /*
                     * Send the refreshed picture
                     * value to the parent.
                     *
                     * After removal this should be null.
                     */
                    if (
                        onUserLoaded &&
                        refreshed.user
                    ) {

                        onUserLoaded({
                            ...refreshed.user,
                            profile_picture:
                                refreshed.profile?.profile_picture ||
                                null,
                        });

                    }

                }

            } catch (refreshError) {

                console.error(
                    "PROFILE REFRESH AFTER REMOVE ERROR:",
                    refreshError
                );

                /*
                 * Do not show an error here because
                 * the removal itself already succeeded.
                 */
            }

        } catch (err) {

            console.error(
                "PROFILE PICTURE REMOVE ERROR:",
                err
            );

            setError(
                err.response?.data?.error ||
                "Unable to remove profile picture."
            );

        } finally {

            setUploadingImage(false);
        }
    };


    const cancelImageSelection = () => {

        setSelectedImage(null);
        setImagePreview(null);
        setShowImageActions(false);

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (
            <div className="profile-message">

                <div className="profile-message-icon">
                    <i className="bi bi-person-circle"></i>
                </div>

                <h2>
                    Loading Profile...
                </h2>

                <p>
                    Getting your profile information.
                </p>

            </div>
        );
    }


    /* =========================================
       ERROR
    ========================================= */

    if (error && !user) {

        return (
            <div className="profile-message profile-error">

                <div className="profile-message-icon">
                    <i className="bi bi-exclamation-circle"></i>
                </div>

                <h2>
                    Unable to Load Profile
                </h2>

                <p>
                    {error}
                </p>

            </div>
        );
    }


    if (!user || !profile) {
        return null;
    }


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="profile-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="profile-header">

                <div>

                    <span className="profile-label">

                        <i className="bi bi-person-circle"></i>

                        YOUR PROFILE

                    </span>

                    <h1>
                        Profile
                    </h1>

                    <p>
                        Manage your personal information
                        and fitness preferences.
                    </p>

                </div>


                {!editing && (

                    <button
                        type="button"
                        className="profile-edit-btn"
                        onClick={() => {

                            setEditing(true);
                            setMessage("");
                            setError("");

                        }}
                    >

                        <i className="bi bi-pencil"></i>

                        Edit Profile

                    </button>

                )}

            </div>


            {/* =================================
                MESSAGES
            ================================= */}

            {message && (

                <div className="profile-success-message">

                    <i className="bi bi-check-circle-fill"></i>

                    {message}

                </div>

            )}


            {error && (

                <div className="profile-error-message">

                    <i className="bi bi-exclamation-circle-fill"></i>

                    {error}

                </div>

            )}


            {/* =================================
                PROFILE HERO
            ================================= */}

            <div className="profile-hero-card">

        <div className="profile-avatar-wrapper">

    <div className="profile-avatar">

        {imagePreview || profile.profile_picture ? (

            <img
                src={
                    imagePreview ||
                    profile.profile_picture
                }
                alt="Profile"
                className="profile-avatar-image"
                style={{
                    width: "88px",
                    height: "88px",
                    maxWidth: "88px",
                    maxHeight: "88px",
                    minWidth: "88px",
                    minHeight: "88px",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                    borderRadius: "50%",
                }}
            />

        ) : (

            user.full_name
                ? user.full_name
                    .slice(0, 1)
                    .toUpperCase()
                : "U"

        )}

    </div>


    <button
        type="button"
        className="profile-picture-edit-btn"
        onClick={() => {
            setShowImageActions(true);
            setError("");
            setMessage("");
        }}
        title="Change profile picture"
    >
        <i className="bi bi-camera-fill"></i>
    </button>

</div>


                <div className="profile-hero-info">

                    <h2>
                        {user.full_name}
                    </h2>

                    <p>
                        {user.email}
                    </p>

                    <span>

                        <i className="bi bi-person-check-fill"></i>

                        {profile.profile_completed
                            ? "Profile Complete"
                            : "Profile Incomplete"
                        }

                    </span>

                </div>

            </div>


            {showImageActions && (

                <div className="profile-picture-card">

                    <div className="profile-picture-card-header">

                        <div>

                            <span className="profile-label">

                                <i className="bi bi-camera"></i>

                                PROFILE PICTURE

                            </span>

                            <h3>
                                Change Profile Picture
                            </h3>

                            <p>
                                Upload a JPG, PNG or WEBP image.
                                Maximum size is 5 MB.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="profile-picture-close"
                            onClick={cancelImageSelection}
                            disabled={uploadingImage}
                        >

                            <i className="bi bi-x-lg"></i>

                        </button>

                    </div>


                    <div className="profile-picture-actions">

                        <label
                            htmlFor="profile-picture-input"
                            className="profile-picture-select-btn"
                        >

                            <i className="bi bi-image"></i>

                            Choose Photo

                        </label>


                        <input
                            id="profile-picture-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageSelect}
                            hidden
                        />


                        {selectedImage && (

                            <>

                                <button
                                    type="button"
                                    className="profile-save-btn"
                                    onClick={handleUploadImage}
                                    disabled={uploadingImage}
                                >

                                    <i
                                        className={
                                            uploadingImage
                                                ? "bi bi-hourglass-split"
                                                : "bi bi-cloud-arrow-up"
                                        }
                                    ></i>

                                    {uploadingImage
                                        ? "Uploading..."
                                        : "Save Photo"
                                    }

                                </button>


                                <button
                                    type="button"
                                    className="profile-cancel-btn"
                                    onClick={cancelImageSelection}
                                    disabled={uploadingImage}
                                >

                                    Cancel

                                </button>

                            </>

                        )}


                        {!selectedImage &&
                            profile.profile_picture && (

                                <button
                                    type="button"
                                    className="profile-remove-picture-btn"
                                    onClick={handleRemoveImage}
                                    disabled={uploadingImage}
                                >

                                    <i className="bi bi-trash3"></i>

                                    Remove Photo

                                </button>

                            )}

                    </div>

                </div>

            )}


            {/* =================================
                PERSONAL INFORMATION
            ================================= */}

            <div className="profile-section">

                <div className="profile-section-heading">

                    <div>

                        <span>
                            PERSONAL INFORMATION
                        </span>

                        <h2>
                            Basic Details
                        </h2>

                    </div>

                </div>


                <div className="profile-form-grid">

                    {/* FULL NAME */}

                    <div className="profile-field">

                        <label>
                            Full Name
                        </label>

                        {editing ? (

                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                            />

                        ) : (

                            <div className="profile-value">
                                {user.full_name || "Not provided"}
                            </div>

                        )}

                    </div>


                    {/* EMAIL */}

                    <div className="profile-field">

                        <label>
                            Email
                        </label>

                        <div className="profile-value">
                            {user.email || "Not provided"}
                        </div>

                        {!editing && (
                            <small>
                                Email cannot be changed here.
                            </small>
                        )}

                    </div>


                    {/* PHONE */}

                    <div className="profile-field">

                        <label>
                            Phone
                        </label>

                        {editing ? (

                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                            />

                        ) : (

                            <div className="profile-value">
                                {user.phone || "Not provided"}
                            </div>

                        )}

                    </div>


                    {/* DATE OF BIRTH */}

                    <div className="profile-field">

                        <label>
                            Date of Birth
                        </label>

                        {editing ? (

                            <input
                                type="date"
                                name="date_of_birth"
                                value={form.date_of_birth}
                                onChange={handleChange}
                            />

                        ) : (

                            <div className="profile-value">
                                {profile.date_of_birth || "Not provided"}
                            </div>

                        )}

                    </div>


                    {/* GENDER */}

                    <div className="profile-field">

                        <label>
                            Gender
                        </label>

                        {editing ? (

                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select gender
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        ) : (

                            <div className="profile-value">
                                {profile.gender || "Not provided"}
                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================
                BODY INFORMATION
            ================================= */}

            <div className="profile-section">

                <div className="profile-section-heading">

                    <div>

                        <span>
                            BODY INFORMATION
                        </span>

                        <h2>
                            Your Measurements
                        </h2>

                    </div>

                </div>


                <div className="profile-form-grid">

                    {/* HEIGHT */}

                    <div className="profile-field">

                        <label>
                            Height
                        </label>

                        {editing ? (

                            <div className="input-with-unit">

                                <input
                                    type="number"
                                    name="height"
                                    value={form.height}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="1"
                                />

                                <span>
                                    cm
                                </span>

                            </div>

                        ) : (

                            <div className="profile-value">

                                {profile.height ?? "Not provided"}

                                {profile.height != null && (
                                    <span>
                                        {" "}cm
                                    </span>
                                )}

                            </div>

                        )}

                    </div>


                    {/* WEIGHT */}

                    <div className="profile-field">

                        <label>
                            Current Weight
                        </label>

                        {editing ? (

                            <div className="input-with-unit">

                                <input
                                    type="number"
                                    name="weight"
                                    value={form.weight}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="1"
                                />

                                <span>
                                    kg
                                </span>

                            </div>

                        ) : (

                            <div className="profile-value">

                                {profile.weight ?? "Not provided"}

                                {profile.weight != null && (
                                    <span>
                                        {" "}kg
                                    </span>
                                )}

                            </div>

                        )}

                    </div>


                    {/* TARGET WEIGHT */}

                    <div className="profile-field">

                        <label>
                            Target Weight
                        </label>

                        {editing ? (

                            <div className="input-with-unit">

                                <input
                                    type="number"
                                    name="target_weight"
                                    value={form.target_weight}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="1"
                                />

                                <span>
                                    kg
                                </span>

                            </div>

                        ) : (

                            <div className="profile-value">

                                {profile.target_weight ?? "Not provided"}

                                {profile.target_weight != null && (
                                    <span>
                                        {" "}kg
                                    </span>
                                )}

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================
                FITNESS PREFERENCES
            ================================= */}

            <div className="profile-section">

                <div className="profile-section-heading">

                    <div>

                        <span>
                            FITNESS PREFERENCES
                        </span>

                        <h2>
                            Your Goals
                        </h2>

                    </div>

                </div>


                <div className="profile-form-grid">

                    {/* FITNESS GOAL */}

                    <div className="profile-field">

                        <label>
                            Fitness Goal
                        </label>

                        {editing ? (

                            <select
                                name="fitness_goal"
                                value={form.fitness_goal}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select goal
                                </option>

                                <option value="Lose Weight">
                                    Lose Weight
                                </option>

                                <option value="Gain Muscle">
                                    Gain Muscle
                                </option>

                                <option value="Maintain Weight">
                                    Maintain Weight
                                </option>

                                <option value="Improve Fitness">
                                    Improve Fitness
                                </option>

                            </select>

                        ) : (

                            <div className="profile-value">
                                {profile.fitness_goal || "Not provided"}
                            </div>

                        )}

                    </div>


                    {/* ACTIVITY */}

                    <div className="profile-field">

                        <label>
                            Activity Level
                        </label>

                        {editing ? (

                            <select
                                name="activity_level"
                                value={form.activity_level}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select activity level
                                </option>

                                <option value="Sedentary">
                                    Sedentary
                                </option>

                                <option value="Lightly Active">
                                    Lightly Active
                                </option>

                                <option value="Moderately Active">
                                    Moderately Active
                                </option>

                                <option value="Very Active">
                                    Very Active
                                </option>

                                <option value="Athlete">
                                    Athlete
                                </option>

                            </select>

                        ) : (

                            <div className="profile-value">
                                {profile.activity_level || "Not provided"}
                            </div>

                        )}

                    </div>


                    {/* DIET */}

                    <div className="profile-field">

                        <label>
                            Diet Preference
                        </label>

                        {editing ? (

                            <select
                                name="diet_preference"
                                value={form.diet_preference}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select diet preference
                                </option>

                                <option value="Vegetarian">
                                    Vegetarian
                                </option>

                                <option value="Eggetarian">
                                    Eggetarian
                                </option>

                                <option value="Non-Vegetarian">
                                    Non-Vegetarian
                                </option>

                                <option value="Vegan">
                                    Vegan
                                </option>

                            </select>

                        ) : (

                            <div className="profile-value">
                                {profile.diet_preference || "Not provided"}
                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================
                HEALTH INFORMATION
            ================================= */}

            <div className="profile-section">

                <div className="profile-section-heading">

                    <div>

                        <span>
                            HEALTH INFORMATION
                        </span>

                        <h2>
                            Additional Details
                        </h2>

                    </div>

                </div>


                <div className="profile-textarea-grid">

                    {/* MEDICAL CONDITIONS */}

                    <div className="profile-field">

                        <label>
                            Medical Conditions
                        </label>

                        {editing ? (

                            <textarea
                                name="medical_conditions"
                                value={
                                    form.medical_conditions
                                }
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter any medical conditions..."
                                style={{
                                    color: "#ffffff",
                                    backgroundColor: "#0b1220",
                                    caretColor: "#22c55e",
                                    WebkitTextFillColor: "#ffffff",
                                }}
                            />

                        ) : (

                            <div className="profile-text-value">

                                {profile.medical_conditions
                                    ? profile.medical_conditions
                                    : "No medical conditions provided."
                                }

                            </div>

                        )}

                    </div>


                    {/* ALLERGIES */}

                    <div className="profile-field">

                        <label>
                            Allergies
                        </label>

                        {editing ? (

                            <textarea
                                name="allergies"
                                value={
                                    form.allergies
                                }
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter any allergies..."
                                style={{
                                    color: "#ffffff",
                                    backgroundColor: "#0b1220",
                                    caretColor: "#22c55e",
                                    WebkitTextFillColor: "#ffffff",
                                }}
                            />

                        ) : (

                            <div className="profile-text-value">

                                {profile.allergies
                                    ? profile.allergies
                                    : "No allergies provided."
                                }

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================
                ACTIONS
            ================================= */}

            {editing && (

                <div className="profile-actions">

                    <button
                        type="button"
                        className="profile-cancel-btn"
                        onClick={handleCancel}
                        disabled={saving}
                    >

                        <i className="bi bi-x-lg"></i>

                        Cancel

                    </button>


                    <button
                        type="button"
                        className="profile-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >

                        <i
                            className={
                                saving
                                    ? "bi bi-hourglass-split"
                                    : "bi bi-check-lg"
                            }
                        ></i>

                        {saving
                            ? "Saving..."
                            : "Save Changes"
                        }

                    </button>

                </div>

            )}

        </div>
    );
}


export default Profile;