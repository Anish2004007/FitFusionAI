import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";


function FitFusionLayout({
    children,
    user,
    onNavigate,
}) {

    // =====================================================
    // API
    // =====================================================

    const API_BASE_URL =
        "http://localhost:8000";


    // =====================================================
    // GREETING
    // =====================================================

    const getGreeting = () => {

        const hour =
            new Date().getHours();

        if (
            hour >= 5 &&
            hour < 12
        ) {
            return "Good Morning";
        }

        if (
            hour >= 12 &&
            hour < 17
        ) {
            return "Good Afternoon";
        }

        if (
            hour >= 17 &&
            hour < 21
        ) {
            return "Good Evening";
        }

        return "Good Night";
    };


    const greeting =
        getGreeting();


    // =====================================================
    // NOTIFICATION STATE
    // =====================================================

    const [
        notifications,
        setNotifications,
    ] = useState([]);


    const [
        unreadCount,
        setUnreadCount,
    ] = useState(0);


    const [
        showNotifications,
        setShowNotifications,
    ] = useState(false);


    const [
        notificationLoading,
        setNotificationLoading,
    ] = useState(false);


    const [
        notificationActionLoading,
        setNotificationActionLoading,
    ] = useState(false);


    const [
        notificationFilter,
        setNotificationFilter,
    ] = useState("all");


    const notificationRef =
        useRef(null);


    // =====================================================
    // SAFE BOOLEAN CONVERSION
    // =====================================================

    const normalizeBoolean = (
        value
    ) => {

        if (
            typeof value ===
            "boolean"
        ) {
            return value;
        }


        if (
            typeof value ===
            "number"
        ) {
            return value === 1;
        }


        if (
            typeof value ===
            "string"
        ) {

            const normalized =
                value
                    .trim()
                    .toLowerCase();

            return (
                normalized === "true" ||
                normalized === "1"
            );
        }


        return false;
    };


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    const loadNotifications =
        useCallback(
            async () => {

                try {

                    setNotificationLoading(
                        true
                    );


                    const response =
                        await fetch(
                            `${API_BASE_URL}/notifications/api/`,
                            {
                                method: "GET",

                                credentials:
                                    "include",

                                headers: {
                                    "Accept":
                                        "application/json",
                                },

                                cache:
                                    "no-store",
                            }
                        );


                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            `Notification API returned ${response.status}`
                        );

                    }


                    const data =
                        await response.json();


                    console.log(
                        "NOTIFICATION API RESPONSE:",
                        data
                    );


                    if (
                        !data ||
                        !data.success
                    ) {

                        throw new Error(
                            data?.error ||
                            "Unable to load notifications."
                        );

                    }


                    const rawNotifications =
                        Array.isArray(
                            data.notifications
                        )
                            ? data.notifications
                            : [];


                    // -----------------------------------------
                    // NORMALIZE NOTIFICATIONS
                    // -----------------------------------------

                    const normalized =
                        rawNotifications.map(
                            (
                                notification
                            ) => {

                                const type =
                                    notification.type ||
                                    notification.notification_type ||
                                    "system";


                                const priority =
                                    String(
                                        notification.priority ||
                                        "medium"
                                    ).toLowerCase();


                                return {

                                    ...notification,

                                    id:
                                        Number(
                                            notification.id
                                        ),

                                    type:

                                        type,

                                    notification_type:

                                        notification.notification_type ||
                                        type,

                                    priority:

                                        priority,

                                    is_read:

                                        normalizeBoolean(
                                            notification.is_read
                                        ),

                                };

                            }
                        );


                    // -----------------------------------------
                    // UPDATE STATE
                    // -----------------------------------------

                    setNotifications(
                        normalized
                    );


                    setUnreadCount(
                        Number(
                            data.unread_count
                        ) || 0
                    );


                } catch (
                    error
                ) {

                    console.error(
                        "Notification API error:",
                        error
                    );

                } finally {

                    setNotificationLoading(
                        false
                    );

                }

            },
            []
        );


    // =====================================================
    // LOAD NOTIFICATIONS ON PAGE LOAD
    // =====================================================

    useEffect(() => {

        loadNotifications();

    }, [
        loadNotifications,
    ]);


    // =====================================================
    // AUTO REFRESH EVERY 30 SECONDS
    // =====================================================

    useEffect(() => {

        const interval =
            setInterval(
                () => {

                    loadNotifications();

                },
                30000
            );


        return () => {

            clearInterval(
                interval
            );

        };

    }, [
        loadNotifications,
    ]);


    // =====================================================
    // CLOSE PANEL WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleClickOutside =
            (event) => {

                if (
                    notificationRef.current &&
                    !notificationRef.current.contains(
                        event.target
                    )
                ) {

                    setShowNotifications(
                        false
                    );

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


    // =====================================================
    // MARK ONE NOTIFICATION AS READ
    // =====================================================

    const markNotificationRead =
        async (
            notificationId
        ) => {

            if (
                notificationActionLoading
            ) {
                return;
            }


            try {

                setNotificationActionLoading(
                    true
                );


                const response =
                    await fetch(
                        `${API_BASE_URL}/notifications/api/${notificationId}/read/`,
                        {
                            method: "POST",

                            credentials:
                                "include",

                            headers: {
                                "Accept":
                                    "application/json",
                            },
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        `Mark read API returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "MARK READ RESPONSE:",
                    data
                );


                if (
                    !data ||
                    !data.success
                ) {

                    throw new Error(
                        data?.error ||
                        "Unable to mark notification as read."
                    );

                }


                // -----------------------------------------
                // UPDATE LOCAL STATE IMMEDIATELY
                // -----------------------------------------

                setNotifications(
                    (
                        previous
                    ) =>
                        previous.map(
                            (
                                notification
                            ) =>
                                Number(
                                    notification.id
                                ) ===
                                Number(
                                    notificationId
                                )
                                    ? {
                                        ...notification,
                                        is_read:
                                            true,
                                    }
                                    : notification
                        )
                );


                // -----------------------------------------
                // USE SERVER COUNT
                // -----------------------------------------

                setUnreadCount(
                    Number(
                        data.unread_count
                    ) || 0
                );


            } catch (
                error
            ) {

                console.error(
                    "Mark notification read error:",
                    error
                );

            } finally {

                setNotificationActionLoading(
                    false
                );

            }

        };


    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =====================================================

    const markAllNotificationsRead =
        async () => {

            if (
                notificationActionLoading
            ) {
                return;
            }


            if (
                unreadCount <= 0
            ) {
                return;
            }


            try {

                setNotificationActionLoading(
                    true
                );


                const response =
                    await fetch(
                        `${API_BASE_URL}/notifications/api/read-all/`,
                        {
                            method: "POST",

                            credentials:
                                "include",

                            headers: {
                                "Accept":
                                    "application/json",
                            },
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        `Mark all API returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "MARK ALL RESPONSE:",
                    data
                );


                if (
                    !data ||
                    !data.success
                ) {

                    throw new Error(
                        data?.error ||
                        "Unable to mark all notifications as read."
                    );

                }


                // -----------------------------------------
                // UPDATE LOCAL STATE
                // -----------------------------------------

                setNotifications(
                    (
                        previous
                    ) =>
                        previous.map(
                            (
                                notification
                            ) => ({
                                ...notification,
                                is_read:
                                    true,
                            })
                        )
                );


                setUnreadCount(
                    0
                );


            } catch (
                error
            ) {

                console.error(
                    "Mark all notifications read error:",
                    error
                );

            } finally {

                setNotificationActionLoading(
                    false
                );

            }

        };


    // =====================================================
    // CLEAR COMPLETED / READ NOTIFICATIONS
    // =====================================================

    const clearCompletedNotifications =
        async () => {

            if (
                notificationActionLoading
            ) {
                return;
            }


            const hasReadNotifications =
                notifications.some(
                    (
                        notification
                    ) =>
                        notification.is_read ===
                        true
                );


            if (
                !hasReadNotifications
            ) {

                return;

            }


            try {

                setNotificationActionLoading(
                    true
                );


                const response =
                    await fetch(
                        `${API_BASE_URL}/notifications/api/clear-completed/`,
                        {
                            method: "DELETE",

                            credentials:
                                "include",

                            headers: {
                                "Accept":
                                    "application/json",
                            },
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        `Clear completed API returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "CLEAR COMPLETED RESPONSE:",
                    data
                );


                if (
                    !data ||
                    !data.success
                ) {

                    throw new Error(
                        data?.error ||
                        "Unable to clear completed notifications."
                    );

                }


                // -----------------------------------------
                // REMOVE READ NOTIFICATIONS LOCALLY
                // -----------------------------------------

                setNotifications(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                notification
                            ) =>
                                notification.is_read !==
                                true
                        )
                );


                // -----------------------------------------
                // SERVER COUNT
                // -----------------------------------------

                setUnreadCount(
                    Number(
                        data.unread_count
                    ) || 0
                );


                // -----------------------------------------
                // ALWAYS SHOW ALL AFTER CLEARING
                // -----------------------------------------

                setNotificationFilter(
                    "all"
                );


            } catch (
                error
            ) {

                console.error(
                    "Clear completed notifications error:",
                    error
                );

            } finally {

                setNotificationActionLoading(
                    false
                );

            }

        };


    // =====================================================
    // DELETE ONE NOTIFICATION
    // =====================================================

    const deleteNotification =
        async (
            notificationId
        ) => {

            if (
                notificationActionLoading
            ) {
                return;
            }


            try {

                setNotificationActionLoading(
                    true
                );


                const response =
                    await fetch(
                        `${API_BASE_URL}/notifications/api/${notificationId}/`,
                        {
                            method: "DELETE",

                            credentials:
                                "include",

                            headers: {
                                "Accept":
                                    "application/json",
                            },
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        `Delete API returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "DELETE RESPONSE:",
                    data
                );


                if (
                    !data ||
                    !data.success
                ) {

                    throw new Error(
                        data?.error ||
                        "Unable to delete notification."
                    );

                }


                // -----------------------------------------
                // REMOVE FROM LOCAL STATE
                // -----------------------------------------

                setNotifications(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                notification
                            ) =>
                                Number(
                                    notification.id
                                ) !==
                                Number(
                                    notificationId
                                )
                        )
                );


                setUnreadCount(
                    Number(
                        data.unread_count
                    ) || 0
                );


            } catch (
                error
            ) {

                console.error(
                    "Delete notification error:",
                    error
                );

            } finally {

                setNotificationActionLoading(
                    false
                );

            }

        };


    // =====================================================
    // FILTER NOTIFICATIONS
    // =====================================================

    const filteredNotifications =
        notifications.filter(
            (
                notification
            ) => {

                const priority =
                    String(
                        notification.priority ||
                        "medium"
                    ).toLowerCase();


                if (
                    notificationFilter ===
                    "unread"
                ) {

                    return (
                        notification.is_read ===
                        false
                    );

                }


                if (
                    notificationFilter ===
                    "high"
                ) {

                    return (
                        priority ===
                        "high"
                    );

                }


                if (
                    notificationFilter ===
                    "medium"
                ) {

                    return (
                        priority ===
                        "medium"
                    );

                }


                if (
                    notificationFilter ===
                    "low"
                ) {

                    return (
                        priority ===
                        "low"
                    );

                }


                return true;

            }
        );


    // =====================================================
    // READ NOTIFICATIONS EXIST
    // =====================================================

    const hasCompletedNotifications =
        notifications.some(
            (
                notification
            ) =>
                notification.is_read ===
                true
        );


    // =====================================================
    // NAVIGATION PATH
    // =====================================================

    const currentPath =
        window.location.pathname;


    // =====================================================
    // ACTIVE MENU
    // =====================================================

    const isDashboard =
        currentPath ===
            "/dashboard/" ||
        currentPath ===
            "/dashboard";


    const isProgress =
        currentPath ===
            "/" ||
        currentPath ===
            "";


    const isWorkout =
        currentPath.startsWith(
            "/workout"
        );


    const isDiet =
        currentPath ===
            "/diet/" ||
        currentPath ===
            "/diet";


    const isProfile =
        currentPath ===
            "/profile/" ||
        currentPath ===
            "/profile";


    const isTracker =
        currentPath ===
            "/tracker/" ||
        currentPath ===
            "/tracker";


    const isAICoach =
        currentPath ===
            "/ai-coach/" ||
        currentPath ===
            "/ai-coach";


    // =====================================================
    // NAVIGATION
    // =====================================================

    const navigate =
        (url) => {

            if (
                onNavigate
            ) {

                onNavigate(
                    url
                );

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


    // =====================================================
    // NOTIFICATION ICON
    // =====================================================

    const getNotificationIcon =
        (type) => {

            switch (
                type
            ) {

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


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
            className="dashboard-layout"
        >


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className="sidebar"
            >


                {/* LOGO */}

                <div
                    className="logo"
                >

                    <span
                        className="logo-icon"
                    >

                        <i className="bi bi-heart-pulse-fill"></i>

                    </span>


                    <span
                        className="logo-text"
                    >
                        FitFusion AI
                    </span>

                </div>


                {/* =================================================
                    MENU
                ================================================= */}

                <ul
                    className="menu"
                >


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

                                navigate(
                                    "/"
                                );

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


                {/* =================================================
                    LOGOUT
                ================================================= */}

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


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main
                className="main-content"
            >


                {/* =================================================
                    TOPBAR
                ================================================= */}

                <header
                    className="topbar"
                >


                    {/* TOPBAR LEFT */}

                    <div
                        className="topbar-left"
                    >

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


                    {/* =================================================
                        TOPBAR RIGHT
                    ================================================= */}

                    <div
                        className="topbar-right"
                    >


                        {/* SEARCH */}

                        <div
                            className="icon-btn"
                        >

                            <i className="bi bi-search"></i>

                        </div>


                        {/* =================================================
                            NOTIFICATIONS
                        ================================================= */}

                        <div
                            className="notification-wrapper"
                            ref={notificationRef}
                        >


                            {/* BELL BUTTON */}

                            <button
                                type="button"
                                className="icon-btn notification-button"
                                onClick={() => {

                                    const nextState =
                                        !showNotifications;


                                    setShowNotifications(
                                        nextState
                                    );


                                    /*
                                     * Always reload when
                                     * opening the panel.
                                     */

                                    if (
                                        nextState
                                    ) {

                                        loadNotifications();

                                    }

                                }}
                                aria-label="Notifications"
                                title="Notifications"
                            >

                                <i className="bi bi-bell"></i>


                                {unreadCount > 0 && (

                                    <span
                                        className="notification-count"
                                    >

                                        {
                                            unreadCount > 99
                                                ? "99+"
                                                : unreadCount
                                        }

                                    </span>

                                )}

                            </button>


                            {/* =================================================
                                NOTIFICATION PANEL
                            ================================================= */}

                            {showNotifications && (

                                <div
                                    className="notification-panel"
                                >


                                    {/* =================================================
                                        HEADER
                                    ================================================= */}

                                    <div
                                        className="notification-panel-header"
                                    >

                                        <div>

                                            <h3>
                                                Notifications
                                            </h3>

                                            <span>
                                                {
                                                    unreadCount
                                                } unread
                                            </span>

                                        </div>


                                        {/* HEADER ACTIONS */}

                                        <div
                                            className="notification-header-actions"
                                        >


                                            {/* MARK ALL */}

                                            {unreadCount > 0 && (

                                                <button
                                                    type="button"
                                                    className="mark-all-button"
                                                    onClick={
                                                        markAllNotificationsRead
                                                    }
                                                    disabled={
                                                        notificationActionLoading
                                                    }
                                                >

                                                    {
                                                        notificationActionLoading
                                                            ? "Working..."
                                                            : "Mark all read"
                                                    }

                                                </button>

                                            )}


                                            {/* CLEAR COMPLETED */}

                                            {hasCompletedNotifications && (

                                                <button
                                                    type="button"
                                                    className="clear-completed-button"
                                                    onClick={
                                                        clearCompletedNotifications
                                                    }
                                                    disabled={
                                                        notificationActionLoading
                                                    }
                                                    title="Remove all read notifications"
                                                >

                                                    {
                                                        notificationActionLoading
                                                            ? "Clearing..."
                                                            : "Clear completed"
                                                    }

                                                </button>

                                            )}

                                        </div>

                                    </div>


                                    {/* =================================================
                                        FILTERS
                                    ================================================= */}

                                    <div
                                        className="notification-filters"
                                    >

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


                                    {/* =================================================
                                        NOTIFICATION LIST
                                    ================================================= */}

                                    <div
                                        className="notification-list"
                                    >

                                        {notificationLoading ? (

                                            <div
                                                className="notification-empty"
                                            >

                                                <i className="bi bi-arrow-repeat"></i>

                                                <strong>
                                                    Loading notifications...
                                                </strong>

                                                <span>
                                                    Please wait.
                                                </span>

                                            </div>

                                        ) : filteredNotifications.length ===
                                          0 ? (

                                            <div
                                                className="notification-empty"
                                            >

                                                <i className="bi bi-bell-slash"></i>

                                                <strong>
                                                    No notifications
                                                </strong>

                                                <span>

                                                    {
                                                        notificationFilter ===
                                                            "all"
                                                            ? "You're all caught up!"
                                                            : "No notifications match this filter."
                                                    }

                                                </span>

                                            </div>

                                        ) : (

                                            filteredNotifications.map(
                                                (
                                                    notification
                                                ) => {

                                                    const priority =
                                                        String(
                                                            notification.priority ||
                                                            "medium"
                                                        ).toLowerCase();


                                                    return (

                                                        <div
                                                            key={
                                                                notification.id
                                                            }
                                                            className={
                                                                `notification-item ${
                                                                    notification.is_read
                                                                        ? "read"
                                                                        : "unread"
                                                                } priority-${priority}`
                                                            }
                                                        >


                                                            {/* ICON */}

                                                            <div
                                                                className="notification-item-icon"
                                                            >

                                                                {
                                                                    getNotificationIcon(
                                                                        notification.type
                                                                    )
                                                                }

                                                            </div>


                                                            {/* CONTENT */}

                                                            <div
                                                                className="notification-item-content"
                                                            >


                                                                {/* TITLE + PRIORITY */}

                                                                <div
                                                                    className="notification-item-title-row"
                                                                >

                                                                    <div
                                                                        className="notification-item-title"
                                                                    >

                                                                        {
                                                                            notification.title
                                                                        }

                                                                    </div>


                                                                    <span
                                                                        className={
                                                                            `notification-priority priority-${priority}`
                                                                        }
                                                                    >

                                                                        {
                                                                            priority.toUpperCase()
                                                                        }

                                                                    </span>

                                                                </div>


                                                                {/* MESSAGE */}

                                                                <div
                                                                    className="notification-item-message"
                                                                >

                                                                    {
                                                                        notification.message
                                                                    }

                                                                </div>


                                                                {/* TIME */}

                                                                <div
                                                                    className="notification-item-time"
                                                                >

                                                                    {
                                                                        notification.time
                                                                    }

                                                                </div>


                                                                {/* ACTIONS */}

                                                                <div
                                                                    className="notification-item-actions"
                                                                >


                                                                    {/* MARK READ */}

                                                                    {!notification.is_read && (

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                markNotificationRead(
                                                                                    notification.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                notificationActionLoading
                                                                            }
                                                                        >

                                                                            Mark as read

                                                                        </button>

                                                                    )}


                                                                    {/* DELETE */}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            deleteNotification(
                                                                                notification.id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            notificationActionLoading
                                                                        }
                                                                        title="Delete notification"
                                                                    >

                                                                        <i className="bi bi-trash"></i>

                                                                    </button>

                                                                </div>

                                                            </div>


                                                            {/* UNREAD DOT */}

                                                            {!notification.is_read && (

                                                                <span
                                                                    className="notification-unread-dot"
                                                                ></span>

                                                            )}

                                                        </div>

                                                    );

                                                }
                                            )

                                        )}

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            PROFILE
                        ================================================= */}

                        <div
                            className="profile-mini"
                        >

                            <div
                                className="mini-avatar"
                            >

                                {
                                    user?.full_name
                                        ? user.full_name
                                            .slice(
                                                0,
                                                1
                                            )
                                            .toUpperCase()
                                        : "U"
                                }

                            </div>

                        </div>


                    </div>

                </header>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <section
                    className="content"
                >

                    {children}

                </section>


            </main>

        </div>

    );

}


export default FitFusionLayout;