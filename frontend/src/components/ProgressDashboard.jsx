import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";


function ProgressDashboard({ progress }) {

    const stats = progress.stats;

    const activity = progress.weekly_activity || [];

    const history = progress.workout_history || [];


    return (
        <div className="progress-dashboard">

            {/* Header */}

            <div className="progress-header">

                <div className="progress-label">
                    <span className="label-icon">✦</span>
                    YOUR FITNESS JOURNEY
                </div>

                <h1>
                    Progress Overview
                </h1>

                <p>
                    Track your consistency, celebrate your
                    achievements, and keep moving forward.
                </p>

            </div>


            {/* Statistics */}

            <div className="progress-stats">

                <div className="stat-card">

                    <div className="stat-icon">
                        ✓
                    </div>

                    <div className="stat-content">

                        <span>
                            Completed Workouts
                        </span>

                        <strong>
                            {stats.total_workouts}
                        </strong>

                        <small>
                            Total completed
                        </small>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        7
                    </div>

                    <div className="stat-content">

                        <span>
                            This Week
                        </span>

                        <strong>
                            {stats.weekly_workouts}
                        </strong>

                        <small>
                            Workouts this week
                        </small>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        %
                    </div>

                    <div className="stat-content">

                        <span>
                            Completion Rate
                        </span>

                        <strong>
                            {stats.completion_rate}%
                        </strong>

                        <small>
                            Overall consistency
                        </small>

                    </div>

                </div>

            </div>


            {/* Weekly Activity */}

            <div className="activity-card">

                <div className="section-heading">

                    <div>

                        <span>
                            WEEKLY ACTIVITY
                        </span>

                        <h2>
                            Workout Activity
                        </h2>

                    </div>

                    <div className="activity-badge">
                        Last 7 days
                    </div>

                </div>


                <div className="chart-container">

                    <ResponsiveContainer
                        width="100%"
                        height={280}
                    >

                        <BarChart
                            data={activity}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 5,
                            }}
                        >

                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                            />

                            <Tooltip
                                cursor={{ opacity: 0.08 }}
                                contentStyle={{
                                    background: "#111827",
                                    border: "1px solid #1e293b",
                                    borderRadius: "12px",
                                    color: "#ffffff",
                                }}
                            />

                            <Bar
                                dataKey="count"
                                fill="#22c55e"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={45}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


            {/* Workout History */}

            <div className="history-section">

                <div className="section-heading">

                    <div>

                        <span>
                            ACTIVITY
                        </span>

                        <h2>
                            Recent Workouts
                        </h2>

                    </div>

                    <div className="history-count">
                        {history.length} records
                    </div>

                </div>


                <div className="workout-history">

                    {history.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ◌
                            </div>

                            <h3>
                                No workouts completed yet
                            </h3>

                            <p>
                                Complete your first workout to
                                start tracking your progress.
                            </p>

                        </div>

                    ) : (

                        history.map((workout) => (

                            <div
                                className="history-card"
                                key={workout.id}
                            >

                                <div className="history-icon">
                                    ✓
                                </div>


                                <div className="history-info">

                                    <h3>
                                        {workout.name}
                                    </h3>

                                    <p>
                                        Completed on{" "}
                                        {new Date(
                                            workout.completed_at
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}
                                    </p>

                                </div>


                                <div className="completed-badge">
                                    <span>✓</span>
                                    Completed
                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>
    );
}


export default ProgressDashboard;