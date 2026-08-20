import { useEffect } from "react";


function WorkoutCompleted({

    workout,

    onBackToWorkout,

    onUserLoaded,

}) {

    /* =========================================
       RESTORE USER FOR NAVBAR
    ========================================= */

    useEffect(() => {

        if (
            onUserLoaded &&
            workout?.user
        ) {

            onUserLoaded(
                workout.user
            );

        }

    }, [
        workout,
        onUserLoaded
    ]);


    const workoutName =
        workout?.workout?.name ||
        "Today's Workout";


    const duration =
        workout?.workout?.duration_minutes;


    return (

        <div className="workout-completed-page">

            <div className="completed-card">


                {/* ================================
                    SUCCESS ICON
                ================================= */}

                <div className="completed-icon">

                    <i className="bi bi-check-lg"></i>

                </div>


                {/* ================================
                    LABEL
                ================================= */}

                <span className="completed-label">

                    WORKOUT COMPLETE

                </span>


                {/* ================================
                    HEADING
                ================================= */}

                <h1>
                    Great Job!
                </h1>


                <p>

                    You successfully completed your{" "}

                    <strong>
                        {workoutName}
                    </strong>.

                </p>


                {/* ================================
                    INFORMATION
                ================================= */}

                <div className="completed-info">

                    <div>

                        <i className="bi bi-check-circle"></i>

                        <span>
                            Workout completed
                        </span>

                    </div>


                    {duration && (

                        <div>

                            <i className="bi bi-clock"></i>

                            <span>
                                {duration} minutes
                            </span>

                        </div>

                    )}

                </div>


                {/* ================================
                    ACTION
                ================================= */}

                <div className="completed-actions">

                    <button
                        type="button"
                        className="back-workout-btn"
                        onClick={
                            onBackToWorkout
                        }
                    >

                        <i className="bi bi-arrow-left"></i>

                        Back to Workout

                    </button>

                </div>

            </div>

        </div>

    );

}


export default WorkoutCompleted;