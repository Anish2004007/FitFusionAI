import { useEffect, useState } from "react";

import {
    getWater,
    addWater,
    deleteWater,
} from "../services/api";


function WaterTracker({ onUserLoaded }) {

    const [water, setWater] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [adding, setAdding] = useState(false);


    // =====================================================
    // LOAD WATER DATA
    // =====================================================

    const loadWater = async () => {

        try {

            setLoading(true);

            setError("");

            const result = await getWater();

            if (result.success) {

                // Store water information
                setWater(result.water);

                // Send logged-in user to App.jsx
                if (
                    result.user &&
                    onUserLoaded
                ) {

                    onUserLoaded(
                        result.user
                    );

                }

            } else {

                setError(
                    result.error ||
                    "Unable to load water tracker."
                );

            }

        } catch (error) {

            console.error(
                "Water tracker error:",
                error
            );

            setError(
                "Unable to connect to Django."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadWater();

    }, []);


    // =====================================================
    // ADD WATER
    // =====================================================

    const handleAddWater = async (amount) => {

        try {

            setAdding(true);

            setError("");

            const result =
                await addWater(amount);


            if (result.success) {

                await loadWater();

            } else {

                setError(
                    result.error ||
                    "Unable to add water."
                );

            }

        } catch (error) {

            console.error(
                "Add water error:",
                error
            );

            setError(
                "Unable to add water."
            );

        } finally {

            setAdding(false);

        }

    };


    // =====================================================
    // DELETE WATER
    // =====================================================

    const handleDeleteWater = async (waterId) => {

        try {

            setError("");

            const result =
                await deleteWater(waterId);


            if (result.success) {

                await loadWater();

            } else {

                setError(
                    result.error ||
                    "Unable to remove water."
                );

            }

        } catch (error) {

            console.error(
                "Delete water error:",
                error
            );

            setError(
                "Unable to remove water."
            );

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="water-page-message">

                Loading water tracker...

            </div>
        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (!water) {

        return (
            <div className="water-page-message error">

                {error || "Water data unavailable."}

            </div>
        );

    }


    return (

        <div className="water-tracker-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="water-header">

                <div className="water-label">

                    <span className="water-label-icon">
                        💧
                    </span>

                    HYDRATION TRACKER

                </div>


                <h1>
                    Water Tracker
                </h1>


                <p>
                    Stay hydrated and keep your body
                    performing at its best.
                </p>

            </div>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div className="water-error">
                    {error}
                </div>

            )}


            {/* =================================================
                MAIN PROGRESS CARD
            ================================================= */}

            <div className="water-progress-card">

                <div className="water-progress-left">

                    <div className="water-big-icon">
                        💧
                    </div>


                    <div>

                        <span className="water-card-label">
                            TODAY'S WATER
                        </span>


                        <div className="water-amount">

                            {water.consumed}

                            <span>
                                ml
                            </span>

                        </div>


                        <p>
                            of {water.daily_goal} ml daily goal
                        </p>

                    </div>

                </div>


                <div className="water-progress-right">

                    <div className="water-progress-top">

                        <span>
                            Daily Progress
                        </span>

                        <strong>
                            {water.percentage}%
                        </strong>

                    </div>


                    <div className="water-progress-bar">

                        <div
                            className="water-progress-fill"
                            style={{
                                width:
                                    `${water.percentage}%`
                            }}
                        />

                    </div>


                    <div className="water-progress-bottom">

                        <span>
                            {water.consumed} ml consumed
                        </span>

                        <span>
                            {water.remaining} ml remaining
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                QUICK ADD
            ================================================= */}

            <div className="water-section">

                <div className="water-section-heading">

                    <div>

                        <span>
                            QUICK ADD
                        </span>

                        <h2>
                            Add Water
                        </h2>

                    </div>

                </div>


                <div className="water-buttons">

                    <button
                        type="button"
                        disabled={adding}
                        onClick={() =>
                            handleAddWater(250)
                        }
                    >
                        <span>
                            💧
                        </span>

                        +250 ml

                    </button>


                    <button
                        type="button"
                        disabled={adding}
                        onClick={() =>
                            handleAddWater(500)
                        }
                    >
                        <span>
                            💧
                        </span>

                        +500 ml

                    </button>


                    <button
                        type="button"
                        disabled={adding}
                        onClick={() =>
                            handleAddWater(750)
                        }
                    >
                        <span>
                            💧
                        </span>

                        +750 ml

                    </button>

                </div>

            </div>


            {/* =================================================
                TODAY'S HISTORY
            ================================================= */}

            <div className="water-section">

                <div className="water-section-heading">

                    <div>

                        <span>
                            TODAY'S ACTIVITY
                        </span>

                        <h2>
                            Water Intake History
                        </h2>

                    </div>


                    <div className="water-history-count">

                        {water.history?.length || 0}

                        {" "}

                        records

                    </div>

                </div>


                <div className="water-history">

                    {!water.history ||
                    water.history.length === 0 ? (

                        <div className="water-empty">

                            <div className="water-empty-icon">
                                💧
                            </div>


                            <h3>
                                No water logged yet
                            </h3>


                            <p>
                                Start tracking your hydration
                                by adding your first glass of water.
                            </p>

                        </div>

                    ) : (

                        water.history.map(
                            (record) => (

                                <div
                                    className="water-history-card"
                                    key={record.id}
                                >

                                    <div className="water-history-icon">
                                        💧
                                    </div>


                                    <div className="water-history-info">

                                        <h3>
                                            {record.amount} ml
                                        </h3>


                                        <p>
                                            Added at {record.time}
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        className="water-delete"
                                        onClick={() =>
                                            handleDeleteWater(
                                                record.id
                                            )
                                        }
                                        title="Remove"
                                    >
                                        ×
                                    </button>

                                </div>

                            )
                        )

                    )}

                </div>

            </div>

        </div>

    );

}


export default WaterTracker;