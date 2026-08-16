function FitFusionLayout({ children, user }) {

    const currentPath = window.location.pathname;

    const isDashboard =
        currentPath === "/dashboard/" ||
        currentPath === "/dashboard";

    const isProgress =
        currentPath === "/" ||
        currentPath === "";


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


                    {/* Dashboard */}

                    <li className={isDashboard ? "active" : ""}>

                        <a href="http://localhost:5173/dashboard/">

                            <i className="bi bi-grid-fill"></i>

                            Dashboard

                        </a>

                    </li>


                    {/* Profile */}

                    <li>

                        <a href="#">

                            <i className="bi bi-person-circle"></i>

                            Profile

                        </a>

                    </li>


                    {/* Workout */}

                    <li>

                        <a href="http://localhost:8000/workout/">

                            <i className="bi bi-heart-pulse"></i>

                            Workout

                        </a>

                    </li>


                    {/* Diet */}

                    <li>

                        <a href="#">

                            <i className="bi bi-egg-fried"></i>

                            Diet

                        </a>

                    </li>


                    {/* Water Tracker */}

                    <li>

                        <a href="#">

                            <i className="bi bi-droplet-half"></i>

                            Water Tracker

                        </a>

                    </li>


                    {/* Progress */}

                    <li className={isProgress ? "active" : ""}>

                        <a href="http://localhost:5173/">

                            <i className="bi bi-graph-up-arrow"></i>

                            Progress

                        </a>

                    </li>


                    {/* AI Coach */}

                    <li>

                        <a href="#">

                            <i className="bi bi-robot"></i>

                            AI Coach

                        </a>

                    </li>


                </ul>


                {/* Logout */}

                <a
                    href="http://localhost:8000/logout/"
                    className="logout"
                >

                    <i className="bi bi-box-arrow-left"></i>

                    Logout

                </a>


            </aside>


            {/* ================= MAIN ================= */}

            <main className="main-content">


                {/* ================= TOPBAR ================= */}

                <header className="topbar">


                    <div className="topbar-left">

                        <span
                            className="greeting"
                            id="dynamicGreeting"
                        >
                            👋 Good Afternoon,
                        </span>


                        <h2>
                            {user?.full_name || "User"}
                        </h2>


                        <p>
                            Stay consistent. You're doing great!
                        </p>

                    </div>


                    <div className="topbar-right">


                        {/* Search */}

                        <div className="icon-btn">

                            <i className="bi bi-search"></i>

                        </div>


                        {/* Notification */}

                        <div className="icon-btn">

                            <i className="bi bi-bell"></i>

                            <span className="notification-dot"></span>

                        </div>


                        {/* Profile */}

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


                {/* ================= PAGE CONTENT ================= */}

                <section className="content">

                    {children}

                </section>


            </main>


        </div>
    );
}


export default FitFusionLayout;