function Dashboard({ dashboard }) {

    const metrics =
        dashboard?.metrics || {
            bmi: "--",
            bmi_category: "Not available",
            water_goal: "--",
            fitness_goal: "Not available",
        };


    const profile =
        dashboard?.profile || {
            weight: "--",
            target_weight: "--",
        };


    const energy =
        dashboard?.energy || {
            bmr: "--",
            tdee: "--",
            calorie_target: "--",
            calorie_adjustment: 0,
        };


    return (

        <div className="dashboard-react-page">


            {/* ================= WELCOME ================= */}

            <div className="welcome-card">

                <div className="welcome-content">

                    <span className="welcome-label">

                        <i className="bi bi-stars"></i>

                        Your Fitness Overview

                    </span>


                    <p>

                        Here's a quick look at your
                        current fitness journey.

                    </p>

                </div>

            </div>


            {/* ================= HEALTH SUMMARY ================= */}

            <div className="dashboard-section">


                <div className="section-heading">

                    <div>

                        <span className="section-label">

                            HEALTH SUMMARY

                        </span>


                        <h2>

                            Your Fitness Metrics

                        </h2>

                    </div>

                </div>


                <div className="stats-grid">


                    {/* BMI */}

                    <div className="stat-card">

                        <div className="stat-icon bmi-icon">

                            <i className="bi bi-heart-pulse-fill"></i>

                        </div>


                        <div className="stat-info">

                            <span className="stat-label">

                                BMI

                            </span>


                            <h3>

                                {metrics.bmi}

                            </h3>


                            <span className="stat-status">

                                {metrics.bmi_category}

                            </span>

                        </div>

                    </div>


                    {/* WATER */}

                    <div className="stat-card">

                        <div className="stat-icon water-icon">

                            <i className="bi bi-droplet-fill"></i>

                        </div>


                        <div className="stat-info">

                            <span className="stat-label">

                                Daily Water Goal

                            </span>


                            <h3>

                                {metrics.water_goal}

                                <small>
                                    L
                                </small>

                            </h3>


                            <span className="stat-status">

                                Recommended daily intake

                            </span>

                        </div>

                    </div>


                    {/* FITNESS GOAL */}

                    <div className="stat-card">

                        <div className="stat-icon goal-icon">

                            <i className="bi bi-bullseye"></i>

                        </div>


                        <div className="stat-info">

                            <span className="stat-label">

                                Fitness Goal

                            </span>


                            <h3 className="goal-value">

                                {metrics.fitness_goal}

                            </h3>


                            <span className="stat-status">

                                Your current objective

                            </span>

                        </div>

                    </div>


                    {/* WEIGHT */}

                    <div className="stat-card">

                        <div className="stat-icon weight-icon">

                            <i className="bi bi-speedometer2"></i>

                        </div>


                        <div className="stat-info">

                            <span className="stat-label">

                                Current Weight

                            </span>


                            <h3>

                                {profile.weight}

                                <small>
                                    kg
                                </small>

                            </h3>


                            <span className="stat-status">

                                Target: {profile.target_weight} kg

                            </span>

                        </div>

                    </div>


                </div>


                {/* ================= ENERGY ================= */}

                <div className="energy-section">


                    <div className="section-heading">

                        <div>

                            <span className="section-label">

                                DAILY ENERGY

                            </span>


                            <h2>

                                Your Calorie Overview

                            </h2>

                        </div>

                    </div>


                    <div className="energy-grid">


                        {/* BMR */}

                        <div className="energy-card">

                            <div className="energy-icon">

                                <i className="bi bi-person-heart"></i>

                            </div>


                            <div>

                                <span>
                                    BMR
                                </span>


                                <h3>

                                    {energy.bmr}

                                    <small>
                                        kcal
                                    </small>

                                </h3>


                                <p>

                                    Calories your body
                                    needs at rest

                                </p>

                            </div>

                        </div>


                        {/* TDEE */}

                        <div className="energy-card">

                            <div className="energy-icon">

                                <i className="bi bi-activity"></i>

                            </div>


                            <div>

                                <span>
                                    TDEE
                                </span>


                                <h3>

                                    {energy.tdee}

                                    <small>
                                        kcal
                                    </small>

                                </h3>


                                <p>

                                    Estimated daily
                                    energy expenditure

                                </p>

                            </div>

                        </div>


                        {/* CALORIE TARGET */}

                        <div className="energy-card calorie-target-card">

                            <div className="energy-icon">

                                <i className="bi bi-fire"></i>

                            </div>


                            <div>

                                <span>

                                    Recommended Calories

                                </span>


                                <h3>

                                    {energy.calorie_target}

                                    <small>
                                        kcal/day
                                    </small>

                                </h3>


                                <p>

                                    {
                                        energy.calorie_adjustment < 0

                                            ? `${energy.calorie_adjustment} kcal from TDEE for weight loss`

                                            : energy.calorie_adjustment > 0

                                                ? `+${energy.calorie_adjustment} kcal from TDEE for muscle gain`

                                                : "Based on your maintenance needs"
                                    }

                                </p>

                            </div>

                        </div>


                    </div>

                </div>


            </div>

        </div>

    );

}


export default Dashboard;