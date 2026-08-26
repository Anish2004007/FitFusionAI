import React, { useEffect, useRef, useState } from "react";


function FitFusionLayout({
    children,
    user,
    onNavigate,
}) {

    /*
     * =========================================
     * DJANGO API BASE URL
     * =========================================
     */

    const API_BASE_URL =
        "http://localhost:8000";


    /*
     * =========================================
     * GREETING
     * =========================================
     */

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
     * NOTIFICATION STATE
     * =========================================
     */

    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [notificationLoading, setNotificationLoading] =
        useState(false);

    const [notificationFilter, setNotificationFilter] =
        useState("all");

    const notificationRef = useRef(null);


    /*
     * =========================================
     * LOAD NOTIFICATIONS
     * =========================================
     */

    const loadNotifications = async () => {

        try {

            setNotificationLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/notifications/api/`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Notification API returned ${response.status}`
                );

            }


            const data =
                await response.json();


            if (
                data &&
                data.success
            ) {

                setNotifications(
                    data.notifications || []
                );

                setUnreadCount(
                    data.unread_count || 0
                );

            }

        } catch (error) {

            console.error(
                "Notification API error:",
                error
            );

        } finally {

            setNotificationLoading(false);

        }

    };


    /*
     * =========================================
     * LOAD ON PAGE LOAD
     * =========================================
     */

    useEffect(() => {

        loadNotifications();

    }, []);


    /*
     * =========================================
     * AUTO REFRESH EVERY 30 SECONDS
     * =========================================
     */

    useEffect(() => {

        const interval =
            setInterval(() => {

                loadNotifications();

            }, 30000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    /*
     * =========================================
     * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
     * =========================================
     */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {

                setShowNotifications(false);

            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    /*
     * =========================================
     * MARK ONE NOTIFICATION AS READ
     * =========================================
     */

    const markNotificationRead = async (
        notificationId
    ) => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/notifications/api/${notificationId}/read/`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Mark read returned ${response.status}`
                );

            }


            const data =
                await response.json();


            if (
                data &&
                data.success
            ) {

                setNotifications((previous) =>
                    previous.map(
                        (notification) =>
                            notification.id ===
                            notificationId
                                ? {
                                    ...notification,
                                    is_read: true,
                                }
                                : notification
                    )
                );


                setUnreadCount((previous) =>
                    Math.max(
                        previous - 1,
                        0
                    )
                );

            }

        } catch (error) {

            console.error(
                "Mark notification read error:",
                error
            );

        }

    };


    /*
     * =========================================
     * MARK ALL NOTIFICATIONS AS READ
     * =========================================
     */

    const markAllNotificationsRead =
        async () => {

            try {

                const response = await fetch(
                    `${API_BASE_URL}/notifications/api/read-all/`,
                    {
                        method: "POST",
                        credentials: "include",
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        `Mark all read returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                if (
                    data &&
                    data.success
                ) {

                    setNotifications((previous) =>
                        previous.map(
                            (notification) => ({
                                ...notification,
                                is_read: true,
                            })
                        )
                    );


                    setUnreadCount(0);

                }

            } catch (error) {

                console.error(
                    "Mark all notifications read error:",
                    error
                );

            }

        };


    /*
     * =========================================
     * FILTER NOTIFICATIONS
     * =========================================
     */

    const filteredNotifications =
        notifications.filter(
            (notification) => {

                if (
                    notificationFilter ===
                    "all"
                ) {

                    return true;

                }


                if (
                    notificationFilter ===
                    "unread"
                ) {

                    return !notification.is_read;

                }


                if (
                    notificationFilter ===
                    "high"
                ) {

                    return (
                        notification.priority ===
                        "high"
                    );

                }


                if (
                    notificationFilter ===
                    "medium"
                ) {

                    return (
                        notification.priority ===
                        "medium"
                    );

                }


                if (
                    notificationFilter ===
                    "low"
                ) {

                    return (
                        notification.priority ===
                        "low"
                    );

                }


                return true;

            }
        );


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


    const isTracker =
        currentPath === "/tracker/" ||
        currentPath === "/tracker";


    const isAICoach =
        currentPath === "/ai-coach/" ||
        currentPath === "/ai-coach";


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
            new PopStateEvent("popstate")
        );

    };


    /*
     * =========================================
     * NOTIFICATION ICON
     * =========================================
     */

    const getNotificationIcon = (
        type
    ) => {

        switch (type) {

            case "hydration":
                return "💧";

            case "workout":
                return "💪";

            case "diet":
                return "🍽️";

            case "goal":
                return "🎯";

            case "ai":
                return "🤖";

            case "system":
                return "🔔";

            default:
                return "🔔";

        }

    };


    /*
     * =========================================
     * RENDER
     * =========================================
     */

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

                            <span>
                                Dashboard
                            </span>

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

                            <span>
                                Profile
                            </span>

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

                            <span>
                                Diet
                            </span>

                        </a>

                    </li>


                    {/* WATER TRACKER */}

                    <li
                        className={
                            isTracker
                                ? "active"
                                : ""
                        }
                    >

                        <a
                            href="/tracker/"
                            onClick={(e) => {

                                e.preventDefault();

                                navigate(
                                    "/tracker/"
                                );

                            }}
                        >

                            <i className="bi bi-droplet-half"></i>

                            <span>
                                Water Tracker
                            </span>

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

                            <span>
                                Progress
                            </span>

                        </a>

                    </li>


                    {/* AI COACH */}

                    <li
                        className={
                            isAICoach
                                ? "active"
                                : ""
                        }
                    >

                        <a
                            href="/ai-coach/"
                            onClick={(e) => {

                                e.preventDefault();

                                navigate(
                                    "/ai-coach/"
                                );

                            }}
                        >

                            <i className="bi bi-robot"></i>

                            <span>
                                AI Coach
                            </span>

                        </a>

                    </li>


                </ul>


                {/* ================= LOGOUT ================= */}

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
                                "Loading..."
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


                        {/* ================= NOTIFICATIONS ================= */}

                        <div
                            className="notification-wrapper"
                            ref={notificationRef}
                        >

                            <button
                                type="button"
                                className="icon-btn notification-button"
                                onClick={() => {

                                    setShowNotifications(
                                        (previous) =>
                                            !previous
                                    );

                                }}
                                aria-label="Notifications"
                            >

                                <i className="bi bi-bell"></i>


                                {unreadCount > 0 && (

                                    <span className="notification-count">

                                        {
                                            unreadCount > 99
                                                ? "99+"
                                                : unreadCount
                                        }

                                    </span>

                                )}

                            </button>


                            {/* ================= NOTIFICATION PANEL ================= */}

                            {showNotifications && (

                                <div className="notification-panel">


                                    {/* HEADER */}

                                    <div className="notification-panel-header">

                                        <div>

                                            <h3>
                                                Notifications
                                            </h3>

                                            <span>
                                                {unreadCount} unread
                                            </span>

                                        </div>


                                        {unreadCount > 0 && (

                                            <button
                                                type="button"
                                                className="mark-all-button"
                                                onClick={
                                                    markAllNotificationsRead
                                                }
                                            >

                                                Mark all as read

                                            </button>

                                        )}

                                    </div>


                                    {/* ================= FILTERS ================= */}

                                    <div className="notification-filters">

                                        <button
                                            type="button"
                                            className={
                                                notificationFilter ===
                                                "all"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setNotificationFilter(
                                                    "all"
                                                )
                                            }
                                        >
                                            All
                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                notificationFilter ===
                                                "unread"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setNotificationFilter(
                                                    "unread"
                                                )
                                            }
                                        >
                                            Unread
                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                notificationFilter ===
                                                "high"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setNotificationFilter(
                                                    "high"
                                                )
                                            }
                                        >
                                            High
                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                notificationFilter ===
                                                "medium"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setNotificationFilter(
                                                    "medium"
                                                )
                                            }
                                        >
                                            Medium
                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                notificationFilter ===
                                                "low"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setNotificationFilter(
                                                    "low"
                                                )
                                            }
                                        >
                                            Low
                                        </button>

                                    </div>


                                    {/* ================= LIST ================= */}

                                    <div className="notification-list">


                                        {notificationLoading ? (

                                            <div className="notification-empty">

                                                Loading notifications...

                                            </div>

                                        ) : filteredNotifications.length === 0 ? (

                                            <div className="notification-empty">

                                                <i className="bi bi-bell-slash"></i>

                                                <strong>
                                                    No notifications
                                                </strong>

                                                <span>
                                                    No notifications match this filter.
                                                </span>

                                            </div>

                                        ) : (

                                            filteredNotifications.map(
                                                (notification) => (

                                                    <button
                                                        type="button"
                                                        key={
                                                            notification.id
                                                        }
                                                        className={`notification-item ${
                                                            notification.is_read
                                                                ? "read"
                                                                : "unread"
                                                        } priority-${
                                                            notification.priority ||
                                                            "medium"
                                                        }`}
                                                        onClick={() => {

                                                            if (
                                                                !notification.is_read
                                                            ) {

                                                                markNotificationRead(
                                                                    notification.id
                                                                );

                                                            }

                                                        }}
                                                    >


                                                        {/* ICON */}

                                                        <div className="notification-item-icon">

                                                            {
                                                                getNotificationIcon(
                                                                    notification.type
                                                                )
                                                            }

                                                        </div>


                                                        {/* CONTENT */}

                                                        <div className="notification-item-content">


                                                            {/* TITLE + PRIORITY */}

                                                            <div className="notification-item-title-row">

                                                                <div className="notification-item-title">

                                                                    {
                                                                        notification.title
                                                                    }

                                                                </div>


                                                                <span
                                                                    className={`notification-priority priority-${
                                                                        notification.priority ||
                                                                        "medium"
                                                                    }`}
                                                                >

                                                                    {
                                                                        (
                                                                            notification.priority ||
                                                                            "medium"
                                                                        ).toUpperCase()
                                                                    }

                                                                </span>

                                                            </div>


                                                            {/* MESSAGE */}

                                                            <div className="notification-item-message">

                                                                {
                                                                    notification.message
                                                                }

                                                            </div>


                                                            {/* TIME */}

                                                            <div className="notification-item-time">

                                                                {
                                                                    notification.time
                                                                }

                                                            </div>

                                                        </div>


                                                        {/* UNREAD DOT */}

                                                        {!notification.is_read && (

                                                            <span className="notification-unread-dot"></span>

                                                        )}

                                                    </button>

                                                )
                                            )

                                        )}

                                    </div>

                                </div>

                            )}

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