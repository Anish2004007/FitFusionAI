import React from "react";


function FitFusionLayout({
    children,
    user,
    onNavigate,
}) {

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good Morning";
    }

    if (hour >= 12 && hour < 17) {
        return "Good Afternoon";
    }

    if (hour >= 17 && hour < 21) {
        return "Good Evening";
    }

    return "Good Night";
};

const greeting = getGreeting();

    /*
     * =========================================
     * CURRENT PATH
     * =========================================
     */

    const currentPath =
        window.location.pathname;


    /*
     * =========================================
     * ACTIVE MENU
     * =========================================
     */

    const isDashboard =
        currentPath === "/dashboard/" ||
        currentPath === "/dashboard";


    const isProgress =
        currentPath === "/" ||
        currentPath === "";


    const isWorkout =
        currentPath.startsWith(
            "/workout"
        );


    const isDiet =
        currentPath === "/diet/" ||
        currentPath === "/diet";

    const isProfile =
    currentPath === "/profile/" ||
    currentPath === "/profile";


    /*
     * =========================================
     * NAVIGATION
     * =========================================
     */

    const navigate = (url) => {

        if (onNavigate) {

            onNavigate(url);

            return;

        }


        window.history.pushState(
            {},
            "",
            url
        );


        window.dispatchEvent(
            new PopStateEvent(
                "popstate"
            )
        );

    };


    return (

        <div className="dashboard-layout">


            {/* ================= SIDEBAR ================= */}

            <aside className="sidebar">


                {/* LOGO */}

                <div className="logo">

                    <span className="logo-icon">

                        <i className="bi bi-heart-pulse-fill"></i>

                    </span>


                    <span className="logo-text">

                        FitFusion AI

                    </span>

                </div>


                {/* ================= NAVIGATION ================= */}

                <ul className="menu">


                    {/* DASHBOARD */}

                    <li
                        className={
                            isDashboard
                                ? "active"
                                : ""
                        }
                    >

                        <a
                            href="/dashboard/"
                            onClick={(e) => {

                                e.preventDefault();

                                navigate(
                                    "/dashboard/"
                                );

                            }}
                        >

                            <i className="bi bi-grid-fill"></i>

                            Dashboard

                        </a>

                    </li>


                    {/* PROFILE */}

                    <li
                        className={
                            isProfile
                                ? "active"
                                : ""
                        }
                    >
                        <a
                            href="/profile/"
                            onClick={(e) => {

                                e.preventDefault();

                                navigate(
                                    "/profile/"
                                );

                        }}
                    >

                        <i className="bi bi-person-circle"></i>

                        Profile

                        </a>
                    </li>


                    {/* WORKOUT */}

                    <li
                        className={
                            isWorkout
                                ? "active"
                                : ""
                        }
                    >

                        <a
                            href="/workout/"
                            onClick={(e) => {

                                e.preventDefault();

                                navigate(
                                    "/workout/"
                                );

                            }}
                        >

                            <i className="bi bi-heart-pulse"></i>

                            <span>
                                Workout
                            </span>

                        </a>

                    </li>


                    {/* DIET */}

                    <li
                        className={
                            isDiet
                                ? "active"
                                : ""
                        }
                    >

                        <a
                            href="/diet/"
                            onClick={(e) => {

                                e.preventDefault();

                                navigate(
                                    "/diet/"
                                );

                            }}
                        >

                            <i className="bi bi-egg-fried"></i>

                            Diet

                        </a>

                    </li>


                    {/* WATER TRACKER */}

                    <li>

                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                        >

                            <i className="bi bi-droplet-half"></i>

                            Water Tracker

                        </a>

                    </li>


                    {/* PROGRESS */}

                    <li
                        className={
                            isProgress
                                ? "active"
                                : ""
                        }
                    >

                        <a
                            href="/"
                            onClick={(e) => {

                                e.preventDefault();

                                navigate("/");

                            }}
                        >

                            <i className="bi bi-graph-up-arrow"></i>

                            Progress

                        </a>

                    </li>


                    {/* AI COACH */}

                    <li>

                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                        >

                            <i className="bi bi-robot"></i>

                            AI Coach

                        </a>

                    </li>


                </ul>


                {/* ================= LOGOUT ================= */}

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
                            👋 {greeting},
                        </span>


                        <h2>

                            {
                                user?.full_name ||
                                "User"
                            }

                        </h2>


                        <p>

                            Stay consistent.
                            You're doing great!

                        </p>

                    </div>


                    <div className="topbar-right">


                        {/* SEARCH */}

                        <div className="icon-btn">

                            <i className="bi bi-search"></i>

                        </div>


                        {/* NOTIFICATION */}

                        <div className="icon-btn">

                            <i className="bi bi-bell"></i>

                            <span className="notification-dot"></span>

                        </div>


                        {/* PROFILE */}

                        <div className="profile-mini">

                            <div className="mini-avatar">

                                {
                                    user?.full_name
                                        ? user.full_name
                                            .slice(0, 1)
                                            .toUpperCase()
                                        : "U"
                                }

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