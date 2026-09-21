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
    // SEARCH STATE
    // =====================================================

    const [
        showSearch,
        setShowSearch,
    ] = useState(false);


    const [
        searchQuery,
        setSearchQuery,
    ] = useState("");


    const searchRef =
        useRef(null);


    const searchInputRef =
        useRef(null);


    // =====================================================
    // HEADER PROFILE PICTURE
    // =====================================================

    const rawProfilePicture =
        user?.profile_picture_url ||
        user?.profile_picture ||
        user?.profile_image ||
        user?.profile?.profile_picture_url ||
        user?.profile?.profile_picture ||
        null;


    const getProfilePictureUrl = (picture) => {

        if (
            !picture ||
            typeof picture !== "string"
        ) {
            return null;
        }


        /*
         * Already a complete URL.
         */

        if (
            picture.startsWith("http://") ||
            picture.startsWith("https://")
        ) {
            return picture;
        }


        /*
         * Django media URL.
         *
         * Example:
         * /media/profile_pictures/photo.jpg
         */

        if (
            picture.startsWith("/")
        ) {

            return (
                "http://localhost:8000" +
                picture
            );

        }


        /*
         * Relative media path.
         */

        return (
            "http://localhost:8000/" +
            picture
        );

    };


    const headerProfilePicture =
        getProfilePictureUrl(
            rawProfilePicture
        );


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
    // SEARCH ITEMS
    // =====================================================

    const searchItems = [
        {
            label: "Dashboard",
            path: "/dashboard/",
            icon: "bi-grid-fill",
            keywords: [
                "dashboard",
                "home",
            ],
        },

        {
            label: "Profile",
            path: "/profile/",
            icon: "bi-person-circle",
            keywords: [
                "profile",
                "account",
                "user",
            ],
        },

        {
            label: "Workout",
            path: "/workout/",
            icon: "bi-heart-pulse",
            keywords: [
                "workout",
                "exercise",
                "training",
                "fitness",
            ],
        },

        {
            label: "Diet",
            path: "/diet/",
            icon: "bi-egg-fried",
            keywords: [
                "diet",
                "food",
                "nutrition",
                "meal",
            ],
        },

        {
            label: "Water Tracker",
            path: "/tracker/",
            icon: "bi-droplet-half",
            keywords: [
                "water",
                "hydration",
                "tracker",
                "drink",
            ],
        },

        {
            label: "Progress",
            path: "/",
            icon: "bi-graph-up-arrow",
            keywords: [
                "progress",
                "stats",
                "history",
                "performance",
            ],
        },

        {
            label: "AI Coach",
            path: "/ai-coach/",
            icon: "bi-robot",
            keywords: [
                "ai",
                "coach",
                "assistant",
                "chat",
            ],
        },
    ];


    // =====================================================
    // FILTER SEARCH RESULTS
    // =====================================================

    const filteredSearchItems =
        searchItems.filter(
            (item) => {

                const query =
                    searchQuery
                        .trim()
                        .toLowerCase();


                /*
                 * Show every page when
                 * search box is empty.
                 */

                if (!query) {
                    return true;
                }


                return (
                    item.label
                        .toLowerCase()
                        .includes(query) ||

                    item.keywords.some(
                        (keyword) =>
                            keyword
                                .toLowerCase()
                                .includes(query)
                    )
                );

            }
        );


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
    // CLOSE NOTIFICATION PANEL WHEN CLICKING OUTSIDE
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
    // SEARCH - CLOSE WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleSearchOutside =
            (event) => {

                if (
                    searchRef.current &&
                    !searchRef.current.contains(
                        event.target
                    )
                ) {

                    setShowSearch(
                        false
                    );

                }

            };


        document.addEventListener(
            "mousedown",
            handleSearchOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleSearchOutside
            );

        };

    }, []);


    // =====================================================
    // SEARCH - ESCAPE KEY
    // =====================================================

    useEffect(() => {

        const handleSearchKeyDown =
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    setShowSearch(
                        false
                    );

                    setSearchQuery(
                        ""
                    );

                }

            };


        document.addEventListener(
            "keydown",
            handleSearchKeyDown
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleSearchKeyDown
            );

        };

    }, []);


    // =====================================================
    // SEARCH - AUTO FOCUS
    // =====================================================

    useEffect(() => {

        if (
            showSearch
        ) {

            setTimeout(
                () => {

                    searchInputRef.current?.focus();

                },
                0
            );

        }

    }, [
        showSearch,
    ]);


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
    // HEADER PROFILE PICTURE STATE
    // =====================================================

    const [
        layoutProfilePicture,
        setLayoutProfilePicture,
    ] = useState(
        headerProfilePicture
    );


    // Keep the navbar in sync when the parent user object changes.

    useEffect(() => {

        setLayoutProfilePicture(
            headerProfilePicture
        );

    }, [
        headerProfilePicture,
    ]);


    // Load the latest profile picture from Django whenever
    // the layout is first loaded or the user navigates.

    useEffect(() => {

        let cancelled = false;


        const loadHeaderProfilePicture =
            async () => {

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/profile/api/`,
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
                            `Profile API returned ${response.status}`
                        );

                    }


                    const data =
                        await response.json();


                    if (
                        cancelled
                    ) {

                        return;

                    }


                    const profilePicture =
                        data?.profile_picture_url ||
                        data?.profile_picture ||
                        data?.profile_image ||
                        data?.profile?.profile_picture_url ||
                        data?.profile?.profile_picture ||
                        data?.user?.profile_picture_url ||
                        data?.user?.profile_picture ||
                        data?.user?.profile_image ||
                        null;


                    setLayoutProfilePicture(
                        getProfilePictureUrl(
                            profilePicture
                        )
                    );


                } catch (
                    error
                ) {

                    console.error(
                        "Header profile picture API error:",
                        error
                    );

                }

            };


        loadHeaderProfilePicture();


        return () => {

            cancelled = true;

        };

    }, [
        currentPath,
        user?.user_id,
    ]);


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
    // SEARCH TOGGLE
    // =====================================================

    const toggleSearch =
        () => {

            const nextState =
                !showSearch;


            setShowSearch(
                nextState
            );


            /*
             * Close notifications
             * when search opens.
             */

            if (
                nextState &&
                showNotifications
            ) {

                setShowNotifications(
                    false
                );

            }

        };


    // =====================================================
    // SEARCH NAVIGATION
    // =====================================================

    const handleSearchNavigate =
        (url) => {

            navigate(
                url
            );


            setShowSearch(
                false
            );


            setSearchQuery(
                ""
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


                        {/* =================================================
                            SEARCH
                        ================================================= */}

                        <div
                            className="search-wrapper"
                            ref={searchRef}
                        >

                            <button
                                type="button"
                                className="icon-btn search-button"
                                onClick={
                                    toggleSearch
                                }
                                aria-label="Search"
                                title="Search"
                            >

                                <i className="bi bi-search"></i>

                            </button>


                            {/* =================================================
                                SEARCH PANEL
                            ================================================= */}

                            {showSearch && (

                                <div
                                    className="search-panel"
                                >


                                    {/* SEARCH INPUT */}

                                    <div
                                        className="search-input-container"
                                    >

                                        <i className="bi bi-search"></i>


                                        <input
                                            ref={
                                                searchInputRef
                                            }
                                            type="text"
                                            value={
                                                searchQuery
                                            }
                                            onChange={
                                                (event) =>
                                                    setSearchQuery(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="Search FitFusion..."
                                            autoComplete="off"
                                        />


                                        {searchQuery && (

                                            <button
                                                type="button"
                                                className="search-clear-button"
                                                onClick={() =>
                                                    setSearchQuery(
                                                        ""
                                                    )
                                                }
                                                aria-label="Clear search"
                                                title="Clear search"
                                            >

                                                <i className="bi bi-x"></i>

                                            </button>

                                        )}

                                    </div>


                                    {/* SEARCH RESULTS */}

                                    <div
                                        className="search-results"
                                    >

                                        {filteredSearchItems.length >
                                        0 ? (

                                            filteredSearchItems.map(
                                                (
                                                    item
                                                ) => (

                                                    <button
                                                        key={
                                                            item.path
                                                        }
                                                        type="button"
                                                        className="search-result-item"
                                                        onClick={() =>
                                                            handleSearchNavigate(
                                                                item.path
                                                            )
                                                        }
                                                    >

                                                        <span
                                                            className="search-result-icon"
                                                        >

                                                            <i
                                                                className={
                                                                    `bi ${item.icon}`
                                                                }
                                                            ></i>

                                                        </span>


                                                    <span className="search-result-text">
                                                        <span className="search-result-title">
                                                            {item.label}
                                                        </span>
                                                    </span>

                                                    </button>

                                                )
                                            )

                                        ) : (

                                            <div
                                                className="search-empty"
                                            >

                                                <i className="bi bi-search"></i>

                                                <span>
                                                    No results found
                                                </span>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )}

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
                                     * Close search when
                                     * notification panel opens.
                                     */

                                    if (
                                        nextState
                                    ) {

                                        setShowSearch(
                                            false
                                        );

                                    }


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
                            PROFILE MINI AVATAR
                        ================================================= */}

                        <div
                            className="profile-mini"
                        >

                            <div
                                className="mini-avatar"
                                style={{
                                    width: "72px",
                                    height: "72px",
                                    minWidth: "72px",
                                    minHeight: "72px",
                                    maxWidth: "72px",
                                    maxHeight: "72px",
                                    overflow: "hidden",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: "0 0 72px",
                                }}
                            >

                                {layoutProfilePicture ? (

                                    <img
                                        src={
                                            layoutProfilePicture
                                        }
                                        alt="Profile"
                                        className="mini-avatar-image"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            minWidth: 0,
                                            minHeight: 0,
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                            flex: "0 0 auto",
                                        }}
                                        onError={(event) => {

                                            event.currentTarget.style.display =
                                                "none";

                                        }}
                                    />

                                ) : (

                                    user?.full_name
                                        ? user.full_name
                                            .slice(0, 1)
                                            .toUpperCase()
                                        : "U"

                                )}

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