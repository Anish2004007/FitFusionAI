import React, { useEffect, useState } from "react";

import {
    clearProgress,
    getProgress,
} from "../services/api";


function ProgressDashboard({ progress }) {

    // =====================================================
    // STATE
    // =====================================================

    const [progressData, setProgressData] = useState(
        progress || {}
    );

    const [clearing, setClearing] = useState(false);

    const [error, setError] = useState("");


    // =====================================================
    // SYNC WITH PARENT
    // =====================================================

    useEffect(() => {

        if (progress) {
            setProgressData(progress);
        }

    }, [progress]);


    // =====================================================
    // DATA
    // =====================================================

    const stats = progressData?.stats || {
        total_workouts: 0,
        weekly_workouts: 0,
        completion_rate: 0,
    };

    const activity =
        progressData?.weekly_activity || [];

    const history =
        progressData?.workout_history || [];


    // =====================================================
    // CLEAR PROGRESS
    // =====================================================

    const handleClearProgress = async () => {

        if (clearing) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to clear your recent workout activity?\n\nThis will permanently remove your completed workout history and reset your progress statistics."
        );

        if (!confirmed) {
            return;
        }

        try {

            setClearing(true);
            setError("");

            const result = await clearProgress();

            console.log(
                "Clear progress response:",
                result
            );

            const updatedProgress =
                await getProgress();

            setProgressData(
                updatedProgress
            );

        } catch (err) {

            console.error(
                "Clear progress error:",
                err
            );

            console.error(
                "Response:",
                err?.response?.data
            );

            setError(
                err?.response?.data?.error ||
                "Unable to clear workout activity. Please try again."
            );

        } finally {

            setClearing(false);

        }
    };


    // =====================================================
    // ACTIVITY MAX
    // =====================================================

    const maxActivity = Math.max(
        ...activity.map(
            (item) => Number(item.count || 0)
        ),
        1
    );


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
            className="progress-dashboard"
            style={{
                width: "100%",
            }}
        >

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "14px 18px",
                        marginBottom: "22px",
                        borderRadius: "12px",
                        background:
                            "rgba(220, 38, 38, 0.10)",
                        border:
                            "1px solid rgba(220, 38, 38, 0.25)",
                        color: "#ef4444",
                        fontSize: "14px",
                    }}
                >
                    {error}
                </div>

            )}


            {/* =================================================
                STATS
            ================================================= */}

            <div
                className="progress-stats"
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",
                    gap: "28px",
                    width: "100%",
                    margin: 0,
                }}
            >

                {/* =============================================
                    TOTAL WORKOUTS
                ============================================= */}

                <div
                    className="stat-card"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "22px",
                        padding: "28px 32px",
                        minHeight: "150px",
                        boxSizing: "border-box",
                        width: "100%",
                    }}
                >

                    <div
                        className="stat-icon"
                        style={{
                            width: "72px",
                            height: "72px",
                            minWidth: "72px",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "20px",
                            fontSize: "30px",
                        }}
                    >
                        🏋️
                    </div>


                    <div
                        className="stat-info"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            gap: "5px",
                            flex: 1,
                            minWidth: 0,
                        }}
                    >

                        <span
                            className="stat-label"
                            style={{
                                display: "block",
                                fontSize: "15px",
                                fontWeight: "600",
                                letterSpacing: "0.5px",
                                textAlign: "left",
                                whiteSpace: "nowrap",
                                margin: 0,
                            }}
                        >
                            TOTAL WORKOUTS
                        </span>


                        <h3
                            style={{
                                margin: 0,
                                fontSize: "42px",
                                lineHeight: "1",
                                fontWeight: "700",
                                textAlign: "left",
                            }}
                        >
                            {stats.total_workouts}
                        </h3>

                    </div>

                </div>


                {/* =============================================
                    THIS WEEK
                ============================================= */}

                <div
                    className="stat-card"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "22px",
                        padding: "28px 32px",
                        minHeight: "150px",
                        boxSizing: "border-box",
                        width: "100%",
                    }}
                >

                    <div
                        className="stat-icon"
                        style={{
                            width: "72px",
                            height: "72px",
                            minWidth: "72px",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "20px",
                            fontSize: "30px",
                        }}
                    >
                        📅
                    </div>


                    <div
                        className="stat-info"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            gap: "5px",
                            flex: 1,
                            minWidth: 0,
                        }}
                    >

                        <span
                            className="stat-label"
                            style={{
                                display: "block",
                                fontSize: "15px",
                                fontWeight: "600",
                                letterSpacing: "0.5px",
                                textAlign: "left",
                                whiteSpace: "nowrap",
                                margin: 0,
                            }}
                        >
                            THIS WEEK
                        </span>


                        <h3
                            style={{
                                margin: 0,
                                fontSize: "42px",
                                lineHeight: "1",
                                fontWeight: "700",
                                textAlign: "left",
                            }}
                        >
                            {stats.weekly_workouts}
                        </h3>

                    </div>

                </div>


                {/* =============================================
                    COMPLETION RATE
                ============================================= */}

                <div
                    className="stat-card"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "22px",
                        padding: "28px 32px",
                        minHeight: "150px",
                        boxSizing: "border-box",
                        width: "100%",
                    }}
                >

                    <div
                        className="stat-icon"
                        style={{
                            width: "72px",
                            height: "72px",
                            minWidth: "72px",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "20px",
                            fontSize: "30px",
                        }}
                    >
                        🎯
                    </div>


                    <div
                        className="stat-info"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            gap: "5px",
                            flex: 1,
                            minWidth: 0,
                        }}
                    >

                        <span
                            className="stat-label"
                            style={{
                                display: "block",
                                fontSize: "15px",
                                fontWeight: "600",
                                letterSpacing: "0.5px",
                                textAlign: "left",
                                whiteSpace: "nowrap",
                                margin: 0,
                            }}
                        >
                            COMPLETION RATE
                        </span>


                        <h3
                            style={{
                                margin: 0,
                                fontSize: "42px",
                                lineHeight: "1",
                                fontWeight: "700",
                                textAlign: "left",
                            }}
                        >
                            {stats.completion_rate}%
                        </h3>

                    </div>

                </div>

            </div>


            {/* =================================================
                WEEKLY ACTIVITY
            ================================================= */}

            <div
                className="progress-section"
                style={{
                    marginTop: "35px",
                }}
            >

                <div
                    className="section-heading"
                    style={{
                        marginBottom: "25px",
                    }}
                >

                    <div>

                        <span className="section-eyebrow">
                            ACTIVITY
                        </span>

                        <h2>
                            Weekly Activity
                        </h2>

                    </div>

                </div>


                {/* =============================================
                    ACTIVITY CHART
                ============================================= */}

                <div
                    style={{
                        width: "100%",
                        height: "260px",
                        display: "flex",
                        alignItems: "stretch",
                        justifyContent: "space-between",
                        gap: "14px",
                        padding:
                            "20px 15px 0 15px",
                        boxSizing: "border-box",
                        borderRadius: "16px",
                        background:
                            "rgba(255, 255, 255, 0.02)",
                        border:
                            "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                >

                    {activity.length > 0 ? (

                        activity.map(
                            (item, index) => {

                                const count =
                                    Number(
                                        item.count || 0
                                    );

                                const percentage =
                                    count > 0
                                        ? (
                                            count /
                                            maxActivity
                                        ) * 100
                                        : 0;

                                return (

                                    <div
                                        key={
                                            `${item.date}-${index}`
                                        }
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                            height: "100%",
                                            display: "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "flex-end",
                                        }}
                                    >

                                        {/* COUNT */}

                                        <div
                                            style={{
                                                height: "24px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                opacity:
                                                    count > 0
                                                        ? 1
                                                        : 0.45,
                                                marginBottom:
                                                    "7px",
                                            }}
                                        >
                                            {count}
                                        </div>


                                        {/* BAR */}

                                        <div
                                            style={{
                                                width: "100%",
                                                maxWidth: "42px",
                                                height: "150px",
                                                display: "flex",
                                                alignItems:
                                                    "flex-end",
                                                justifyContent:
                                                    "center",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width: "100%",
                                                    height:
                                                        count > 0
                                                            ? `${Math.max(
                                                                percentage,
                                                                8
                                                            )}%`
                                                            : "5px",
                                                    minHeight:
                                                        count > 0
                                                            ? "12px"
                                                            : "5px",
                                                    borderRadius:
                                                        "8px 8px 3px 3px",
                                                    background:
                                                        count > 0
                                                            ? "linear-gradient(180deg, #22c55e, #16a34a)"
                                                            : "rgba(255,255,255,0.10)",
                                                    transition:
                                                        "height 0.4s ease",
                                                    boxShadow:
                                                        count > 0
                                                            ? "0 4px 15px rgba(34,197,94,0.20)"
                                                            : "none",
                                                }}
                                            />

                                        </div>


                                        {/* DAY */}

                                        <div
                                            style={{
                                                marginTop: "12px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {item.day}
                                        </div>


                                        {/* DATE */}

                                        <div
                                            style={{
                                                marginTop: "3px",
                                                fontSize: "10px",
                                                opacity: 0.55,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {item.date}
                                        </div>

                                    </div>

                                );

                            }
                        )

                    ) : (

                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.6,
                                fontSize: "14px",
                            }}
                        >
                            No activity data available.
                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                RECENT WORKOUTS
            ================================================= */}

            <div
                className="progress-section"
                style={{
                    marginTop: "35px",
                }}
            >

                {/* =============================================
                    HEADER
                ============================================= */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent:
                            "space-between",
                        gap: "20px",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                    }}
                >

                    <div>

                        <span className="section-eyebrow">
                            ACTIVITY
                        </span>

                        <h2>
                            Recent Workouts
                        </h2>

                    </div>


                    {/* =========================================
                        RIGHT SIDE
                    ========================================= */}

                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: "12px",
                        }}
                    >

                        <div
                            className="history-count"
                        >
                            {history.length} records
                        </div>


                        {history.length > 0 && (

                            <button
                                type="button"
                                onClick={
                                    handleClearProgress
                                }
                                disabled={clearing}
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    gap: "8px",
                                    padding:
                                        "11px 18px",
                                    border: "none",
                                    borderRadius:
                                        "9px",
                                    background:
                                        clearing
                                            ? "#7f1d1d"
                                            : "#dc2626",
                                    color:
                                        "#ffffff",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "700",
                                    cursor:
                                        clearing
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        clearing
                                            ? 0.7
                                            : 1,
                                }}
                            >

                                {clearing
                                    ? "Clearing..."
                                    : "🗑️ Clear"}

                            </button>

                        )}

                    </div>

                </div>


                {/* =============================================
                    HISTORY LIST
                ============================================= */}

                {history.length > 0 ? (

                    <div
                        className="workout-history"
                    >

                        {history.map(
                            (workout, index) => {

                                let completedDate =
                                    "Completed";

                                if (
                                    workout.completed_at
                                ) {

                                    const date =
                                        new Date(
                                            workout.completed_at
                                        );

                                    if (
                                        !Number.isNaN(
                                            date.getTime()
                                        )
                                    ) {

                                        completedDate =
                                            date.toLocaleDateString(
                                                undefined,
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                }
                                            );

                                    }

                                }

                                return (

                                    <div
                                        className="history-card"
                                        key={
                                            workout.id ??
                                            index
                                        }
                                    >

                                        <div
                                            className="history-workout-info"
                                        >

                                            <div
                                                className="history-workout-icon"
                                            >
                                                🏋️
                                            </div>


                                            <div>

                                                <h3>
                                                    {
                                                        workout.name
                                                    }
                                                </h3>

                                                <span>
                                                    {
                                                        completedDate
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        <div
                                            className="completed-badge"
                                        >
                                            ✓ Completed
                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                ) : (

                    <div
                        className="empty-history"
                        style={{
                            padding:
                                "45px 20px",
                            textAlign:
                                "center",
                        }}
                    >

                        <div
                            style={{
                                fontSize:
                                    "38px",
                                marginBottom:
                                    "10px",
                            }}
                        >
                            🏃
                        </div>

                        <h3>
                            No Recent Workouts
                        </h3>

                        <p>
                            Complete a workout to
                            see your activity here.
                        </p>

                    </div>

                )}

            </div>

        </div>

    );
}


export default ProgressDashboard;