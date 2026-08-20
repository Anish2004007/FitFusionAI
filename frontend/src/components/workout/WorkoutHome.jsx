import { useEffect, useState } from "react";

import {
    getWorkout,
    startWorkout,
} from "../../services/api";


function WorkoutHome({
    onWorkoutStarted,
    onUserLoaded,
}) {

    const [workout, setWorkout] = useState(null);

    const [loading, setLoading] = useState(true);

    const [starting, setStarting] = useState(false);

    const [error, setError] = useState("");


    /* =========================================
       LOAD WORKOUT
    ========================================= */

    useEffect(() => {

        const loadWorkout = async () => {

            try {

                const data = await getWorkout();


                if (data.success) {

                    setWorkout(data);


                    /*
                     * IMPORTANT:
                     * Send the logged-in user to App.jsx
                     * when Workout Home loads.
                     */

                    if (
                        onUserLoaded &&
                        data.user
                    ) {

                        onUserLoaded(
                            data.user
                        );

                    }

                } else {

                    setError(
                        data.error ||
                        "Unable to load workout."
                    );

                }

            } catch (error) {

                console.error(error);

                setError(
                    "Unable to connect to Django."
                );

            } finally {

                setLoading(false);

            }

        };


        loadWorkout();

    }, [onUserLoaded]);


    /* =========================================
       START WORKOUT
    ========================================= */

    const handleStartWorkout = async () => {

        try {

            setStarting(true);

            setError("");


            const data =
                await startWorkout();


            if (data.success) {

                /*
                 * Start API creates the workout session
                 * and returns its ID.
                 */

                if (onWorkoutStarted) {

                    onWorkoutStarted(
                        data.session_id
                    );

                }

            } else {

                setError(
                    data.error ||
                    "Unable to start workout."
                );

            }

        } catch (error) {

            console.error(error);

            setError(
                "Unable to start workout."
            );

        } finally {

            setStarting(false);

        }

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="workout-message">

                <div className="workout-loading-icon">

                    <i className="bi bi-heart-pulse-fill"></i>

                </div>


                <h2>
                    Loading Workout...
                </h2>


                <p>
                    Preparing your personalized workout.
                </p>

            </div>

        );

    }


    /* =========================================
       ERROR
    ========================================= */

    if (error) {

        return (

            <div className="workout-message workout-error">

                <div className="workout-loading-icon">

                    <i className="bi bi-exclamation-circle"></i>

                </div>


                <h2>
                    Unable to Load Workout
                </h2>


                <p>
                    {error}
                </p>

            </div>

        );

    }


    const plan =
        workout?.workout_plan;


    /* =========================================
       NO WORKOUT
    ========================================= */

    if (!plan) {

        return (

            <div className="no-workout-card">

                <i className="bi bi-calendar-x"></i>


                <h2>
                    No Workout Plan Available
                </h2>


                <p>
                    We couldn't find a workout plan
                    for your current fitness goal.
                </p>

            </div>

        );

    }


    /* =========================================
       EXERCISE ICON
    ========================================= */

    const getExerciseIcon = (category) => {

        if (category === "Cardio") {

            return "bi-lightning-charge-fill";

        }


        if (category === "Strength") {

            return "bi-person-arms-up";

        }


        if (category === "Flexibility") {

            return "bi-person-standing";

        }


        return "bi-person-walking";

    };


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="workout-page">


            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="workout-header">

                <div>

                    <span className="workout-label">

                        <i className="bi bi-fire"></i>

                        YOUR WORKOUT

                    </span>


                    <h1>
                        Today's Workout
                    </h1>


                    <p>
                        A personalized workout based
                        on your fitness goal.
                    </p>

                </div>

            </div>


            {/* =================================
                WORKOUT PLAN
            ================================= */}

            <div className="workout-plan-card">

                <div className="workout-plan-top">

                    <div>

                        <span className="plan-label">

                            PERSONALIZED PLAN

                        </span>


                        <h2>
                            {plan.name}
                        </h2>


                        <p>
                            {plan.description}
                        </p>

                    </div>


                    <div className="workout-duration">

                        <i className="bi bi-clock"></i>


                        <span>
                            {plan.duration_minutes} min
                        </span>

                    </div>

                </div>


                {/* =================================
                    WORKOUT INFORMATION
                ================================= */}

                <div className="workout-info-grid">


                    <div className="workout-info">

                        <i className="bi bi-bullseye"></i>


                        <div>

                            <span>
                                Goal
                            </span>


                            <strong>
                                {plan.goal}
                            </strong>

                        </div>

                    </div>


                    <div className="workout-info">

                        <i className="bi bi-bar-chart"></i>


                        <div>

                            <span>
                                Difficulty
                            </span>


                            <strong>
                                {plan.difficulty}
                            </strong>

                        </div>

                    </div>


                    <div className="workout-info">

                        <i className="bi bi-list-check"></i>


                        <div>

                            <span>
                                Exercises
                            </span>


                            <strong>
                                {plan.exercise_count}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================
                EXERCISES
            ================================= */}

            <div className="exercise-section">

                <div className="section-title">

                    <div>

                        <span>
                            WORKOUT ROUTINE
                        </span>


                        <h2>
                            Today's Exercises
                        </h2>

                    </div>

                </div>


                <div className="exercise-grid">

                    {plan.exercises.map(
                        (exercise, index) => (

                            <div
                                className="exercise-card"
                                key={exercise.id}
                            >

                                <div className="exercise-number">

                                    {index + 1}

                                </div>


                                <div className="exercise-icon">

                                    <i
                                        className={
                                            `bi ${getExerciseIcon(
                                                exercise.category
                                            )}`
                                        }
                                    ></i>

                                </div>


                                <div className="exercise-content">

                                    <h3>
                                        {exercise.name}
                                    </h3>


                                    <p>
                                        {exercise.description}
                                    </p>


                                    <div className="exercise-meta">

                                        <span>

                                            <i className="bi bi-bullseye"></i>

                                            {exercise.muscle_group}

                                        </span>


                                        {exercise.duration_minutes && (

                                            <span>

                                                <i className="bi bi-clock"></i>

                                                {exercise.duration_minutes}
                                                {" "}min

                                            </span>

                                        )}

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* =================================
                START WORKOUT
            ================================= */}

            <div className="workout-action">

                <button
                    type="button"
                    className="start-workout-btn"
                    onClick={handleStartWorkout}
                    disabled={starting}
                >

                    <i
                        className={
                            starting
                                ? "bi bi-hourglass-split"
                                : "bi bi-play-fill"
                        }
                    ></i>


                    {starting
                        ? "Starting Workout..."
                        : "Start Workout"
                    }

                </button>

            </div>

        </div>

    );

}


export default WorkoutHome;