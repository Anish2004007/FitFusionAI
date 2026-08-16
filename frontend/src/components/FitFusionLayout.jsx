function FitFusionLayout({ children, user }) {

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return "🌅 Good Morning,";
        } else if (hour >= 12 && hour < 17) {
            return "☀️ Good Afternoon,";
        } else if (hour >= 17 && hour < 21) {
            return "🌆 Good Evening,";
        }

        return "🌙 Good Night,";
    };

    return (
        <div className="dashboard-layout">

            {/* ================= SIDEBAR ================= */}

            <aside className="sidebar">

                {/* Logo */}

                <div className="logo">

                    <span className="logo-icon">
                        <i className="bi bi-heart-pulse-fill"></i>
                    </span>

                    <span className="logo-text">
                        FitFusion AI
                    </span>

                </div>


                {/* Navigation */}

                <ul className="menu">

                    <li>

                        <a href="http://localhost:8000/dashboard/">

                            <i className="bi bi-grid-fill"></i>

                            <span>
                                Dashboard
                            </span>

                        </a>

                    </li>


                    <li>

                        <a href="#">

                            <i className="bi bi-person-circle"></i>

                            <span>
                                Profile
                            </span>

                        </a>

                    </li>


                    <li>

                        <a href="http://localhost:8000/workout/">

                            <i className="bi bi-heart-pulse"></i>

                            <span>
                                Workout
                            </span>

                        </a>

                    </li>


                    <li>

                        <a href="#">

                            <i className="bi bi-egg-fried"></i>

                            <span>
                                Diet
                            </span>

                        </a>

                    </li>


                    <li>

                        <a href="#">

                            <i className="bi bi-droplet-half"></i>

                            <span>
                                Water Tracker
                            </span>

                        </a>

                    </li>


                    {/* React Progress Page */}

                    <li className="active">

                        <a href="http://localhost:5173/">

                            <i className="bi bi-graph-up-arrow"></i>

                            <span>
                                Progress
                            </span>

                        </a>

                    </li>


                    <li>

                        <a href="#">

                            <i className="bi bi-robot"></i>

                            <span>
                                AI Coach
                            </span>

                        </a>

                    </li>

                </ul>


                {/* Logout */}

                <a
                    href="http://localhost:8000/logout/"
                    className="logout"
                >

                    <i className="bi bi-box-arrow-left"></i>

                    <span>
                        Logout
                    </span>

                </a>

            </aside>


            {/* ================= MAIN CONTENT ================= */}

            <main className="main-content">

                {/* ================= TOPBAR ================= */}

                <header className="topbar">

                    <div className="topbar-left">

                        <span className="greeting">

                            {getGreeting()}

                        </span>

                        <h2>

                            {user?.full_name || "User"}

                        </h2>

                        <p>

                            Stay consistent. You're doing great!

                        </p>

                    </div>


                    {/* Topbar Right */}

                    <div className="topbar-right">

                        <div className="icon-btn">

                            <i className="bi bi-search"></i>

                        </div>


                        <div className="icon-btn">

                            <i className="bi bi-bell"></i>

                            <span className="notification-dot"></span>

                        </div>


                        <div className="profile-mini">

                            <div className="mini-avatar">

                                {user?.full_name
                                    ? user.full_name
                                        .slice(0, 1)
                                        .toUpperCase()
                                    : "U"}

                            </div>

                        </div>

                    </div>

                </header>


                {/* ================= CONTENT ================= */}

                <section className="content">

                    {children}

                </section>

            </main>

        </div>
    );
}


export default FitFusionLayout;