import { useEffect, useState } from "react";

import {
    getWorkoutSession,
    completeExercise,
    completeWorkout,
} from "../../services/api";


function WorkoutSession({
    sessionId,
    onWorkoutCompleted,
    onUserLoaded,
}) {

    const [session, setSession] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [completingExercise, setCompletingExercise] =
        useState(null);

    const [completingWorkout, setCompletingWorkout] =
        useState(false);


    /* =========================================
       LOAD SESSION
    ========================================= */

    useEffect(() => {

        const loadSession = async () => {

            try {

                const data =
                    await getWorkoutSession(sessionId);


                if (data.success) {

                    setSession(data);


                    /*
                     * Restore logged-in user.
                     *
                     * This is what makes the navbar
                     * work even after refreshing the
                     * Workout Session page.
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
                        "Unable to load workout session."
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


        if (sessionId) {

            loadSession();

        } else {

            setError(
                "Workout session not found."
            );

            setLoading(false);

        }

    }, [
        sessionId,
        onUserLoaded
    ]);


    /* =========================================
       COMPLETE EXERCISE
    ========================================= */

    const handleCompleteExercise = async (
        exerciseId
    ) => {

        try {

            setCompletingExercise(
                exerciseId
            );

            setError("");


            const data =
                await completeExercise(
                    sessionId,
                    exerciseId
                );


            if (!data.success) {

                setError(
                    data.error ||
                    "Unable to complete exercise."
                );

                return;

            }


            /*
             * Update the exercise locally.
             */

            setSession((previous) => {

                if (!previous) {

                    return previous;

                }


                const updatedExercises =
                    previous.exercises.map(
                        (exercise) => {

                            if (
                                exercise.exercise_id ===
                                exerciseId
                            ) {

                                return {
                                    ...exercise,
                                    completed: true,
                                };

                            }

                            return exercise;

                        }
                    );


                return {

                    ...previous,

                    exercises:
                        updatedExercises,

                    completed_exercises:
                        data.completed_exercises,

                    total_exercises:
                        data.total_exercises,

                    progress_percentage:
                        data.progress_percentage,

                };

            });


        } catch (error) {

            console.error(error);

            setError(
                "Unable to complete the exercise."
            );

        } finally {

            setCompletingExercise(null);

        }

    };


    /* =========================================
       COMPLETE WORKOUT
    ========================================= */

    const handleCompleteWorkout = async () => {

        try {

            setCompletingWorkout(true);

            setError("");


            const data =
                await completeWorkout(
                    sessionId
                );


            if (!data.success) {

                setError(
                    data.error ||
                    "Unable to complete workout."
                );

                return;

            }


            /*
             * Keep the user information available
             * before moving to Completed page.
             */

            if (
                onUserLoaded &&
                data.user
            ) {

                onUserLoaded(
                    data.user
                );

            }


            if (onWorkoutCompleted) {

                onWorkoutCompleted(
                    data
                );

            }


        } catch (error) {

            console.error(error);

            setError(
                "Unable to complete workout."
            );

        } finally {

            setCompletingWorkout(false);

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
                    Loading Workout Session...
                </h2>

                <p>
                    Preparing your exercises.
                </p>

            </div>

        );

    }


    /* =========================================
       ERROR / NO SESSION
    ========================================= */

    if (error && !session) {

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


    if (!session) {

        return null;

    }


    const plan =
        session.workout_plan;


    const exercises =
        session.exercises || [];


    const progress =
        session.progress_percentage || 0;


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

        <div className="workout-session-page">

            {/* ================================
                HEADER
            ================================= */}

            <div className="session-header">

                <div>

                    <span className="workout-label">

                        <i className="bi bi-lightning-charge-fill"></i>

                        WORKOUT SESSION

                    </span>


                    <h1>
                        {plan.name}
                    </h1>


                    <p>
                        Complete each exercise to finish
                        today's workout.
                    </p>

                </div>

            </div>


            {/* ================================
                ERROR MESSAGE
            ================================= */}

            {error && (

                <div className="session-error">

                    <i className="bi bi-exclamation-circle"></i>

                    {error}

                </div>

            )}


            {/* ================================
                PROGRESS
            ================================= */}

            <div className="session-progress">

                <div className="progress-header">

                    <div>

                        <span>
                            WORKOUT PROGRESS
                        </span>


                        <h2>

                            {session.completed_exercises}
                            {" / "}
                            {session.total_exercises}
                            {" "}
                            Exercises Completed

                        </h2>

                    </div>


                    <strong>
                        {progress}%
                    </strong>

                </div>


                <div className="progress-track">

                    <div
                        className="progress-fill"
                        style={{
                            width: `${progress}%`,
                        }}
                    ></div>

                </div>

            </div>


            {/* ================================
                EXERCISES
            ================================= */}

            <div className="session-exercises">

                <div className="section-title">

                    <span>
                        EXERCISES
                    </span>

                    <h2>
                        Today's Routine
                    </h2>

                </div>


                <div className="session-exercise-list">

                    {exercises.map(
                        (exercise, index) => (

                            <div
                                className="session-exercise-card"
                                key={exercise.id}
                            >

                                <div className="session-exercise-number">

                                    {index + 1}

                                </div>


                                <div className="session-exercise-icon">

                                    <i
                                        className={
                                            `bi ${getExerciseIcon(
                                                exercise.category
                                            )}`
                                        }
                                    ></i>

                                </div>


                                <div className="session-exercise-content">

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


                                        <span>

                                            <i className="bi bi-bar-chart"></i>

                                            {exercise.difficulty}

                                        </span>

                                    </div>

                                </div>


                                <div className="exercise-status">

                                    {exercise.completed ? (

                                        <span className="exercise-completed">

                                            <i className="bi bi-check-circle-fill"></i>

                                            Completed

                                        </span>

                                    ) : (

                                        <button
                                            type="button"
                                            className="complete-exercise-btn"
                                            onClick={() =>
                                                handleCompleteExercise(
                                                    exercise.exercise_id
                                                )
                                            }
                                            disabled={
                                                completingExercise ===
                                                exercise.exercise_id
                                            }
                                        >

                                            <i
                                                className={
                                                    completingExercise ===
                                                    exercise.exercise_id
                                                        ? "bi bi-hourglass-split"
                                                        : "bi bi-check2"
                                                }
                                            ></i>


                                            {completingExercise ===
                                            exercise.exercise_id
                                                ? "Completing..."
                                                : "Mark Complete"
                                            }

                                        </button>

                                    )}

                                </div>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* ================================
                COMPLETE WORKOUT
            ================================= */}

            <div className="session-action">

                {progress === 100 ? (

                    <button
                        type="button"
                        className="complete-workout-btn"
                        onClick={
                            handleCompleteWorkout
                        }
                        disabled={
                            completingWorkout
                        }
                    >

                        <i
                            className={
                                completingWorkout
                                    ? "bi bi-hourglass-split"
                                    : "bi bi-check-circle-fill"
                            }
                        ></i>


                        {completingWorkout
                            ? "Completing Workout..."
                            : "Complete Workout"
                        }

                    </button>

                ) : (

                    <div className="complete-workout-disabled">

                        <i className="bi bi-lock-fill"></i>

                        Complete all exercises to finish

                    </div>

                )}

            </div>

        </div>

    );

}


export default WorkoutSession;