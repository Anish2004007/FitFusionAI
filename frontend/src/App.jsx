import { useEffect, useState } from "react";

import {
    getProgress,
    getDashboard,
} from "./services/api";

import ProgressDashboard from "./components/ProgressDashboard";
import Dashboard from "./components/Dashboard";

import WorkoutHome from "./components/workout/WorkoutHome";
import WorkoutSession from "./components/workout/WorkoutSession";
import WorkoutCompleted from "./components/workout/WorkoutCompleted";

import DietHome from "./components/diet/DietHome";

import Profile from "./components/profile";

import WaterTracker from "./components/WaterTracker";

import FitFusionLayout from "./components/FitFusionLayout";

import "./App.css";


function App() {

    const [page, setPage] = useState(
        window.location.pathname
    );

    const [data, setData] = useState(null);

    const [workoutUser, setWorkoutUser] =
        useState(null);

    const [dietUser, setDietUser] =
        useState(null);

    const [profileUser, setProfileUser] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [trackerUser, setTrackerUser] =
    useState(null);


    /*
     * =========================================
     * NORMALIZE URL
     * =========================================
     */

    const normalizePath = (path) => {

        if (!path) {
            return "/";
        }

        if (
            path !== "/" &&
            !path.endsWith("/")
        ) {
            return path + "/";
        }

        return path;
    };


    /*
     * =========================================
     * NAVIGATION
     * =========================================
     */

    const navigate = (url) => {

        const normalizedUrl =
            normalizePath(url);

        window.history.pushState(
            {},
            "",
            normalizedUrl
        );

        setPage(normalizedUrl);
    };


    /*
     * =========================================
     * BROWSER BACK / FORWARD
     * =========================================
     */

    useEffect(() => {

        const handlePopState = () => {

            setPage(
                normalizePath(
                    window.location.pathname
                )
            );

        };


        window.addEventListener(
            "popstate",
            handlePopState
        );


        return () => {

            window.removeEventListener(
                "popstate",
                handlePopState
            );

        };

    }, []);


    /*
     * =========================================
     * CURRENT ROUTE
     * =========================================
     */

    const currentPage =
        normalizePath(page);


    const isDashboard =
        currentPage === "/dashboard/";


    const isProgress =
        currentPage === "/";


    const isWorkout =
        currentPage.startsWith(
            "/workout/"
        );


    const isDiet =
        currentPage === "/diet/";


    const isProfile =
        currentPage === "/profile/";


    const isTracker =
        currentPage === "/tracker/";


    /*
     * =========================================
     * LOAD DASHBOARD / PROGRESS DATA
     * =========================================
     *
     * Workout, Diet, Profile and Water Tracker
     * load their own API data.
     */

    useEffect(() => {

        let cancelled = false;


        const loadPageData = async () => {

            /*
             * These pages have their own
             * API calls.
             */

            if (
                isWorkout ||
                isDiet ||
                isProfile ||
                isTracker
            ) {

                setLoading(false);
                setError("");

                return;

            }


            /*
             * Only Dashboard and Progress
             * use this data loader.
             */

            if (
                !isDashboard &&
                !isProgress
            ) {

                setLoading(false);

                return;

            }


            setLoading(true);
            setError("");
            setData(null);


            try {

                let result;


                if (isDashboard) {

                    result =
                        await getDashboard();

                } else {

                    result =
                        await getProgress();

                }


                /*
                 * Ignore old request if
                 * user changed page.
                 */

                if (cancelled) {
                    return;
                }


                if (
                    result &&
                    result.success
                ) {

                    setData(result);

                } else {

                    setData(null);

                    setError(
                        result?.error ||
                        "Unable to load data."
                    );

                }

            } catch (err) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "API ERROR:",
                    err
                );


                setData(null);

                setError(
                    "Unable to connect to Django."
                );

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        };


        loadPageData();


        return () => {

            cancelled = true;

        };

    }, [
        currentPage,
        isDashboard,
        isProgress,
        isWorkout,
        isDiet,
        isProfile,
        isTracker,
    ]);


    /*
     * =========================================
     * LOADING SCREEN
     * =========================================
     */

    if (
        loading &&
        (isDashboard || isProgress)
    ) {

        return (

            <div className="app-message">

                Loading...

            </div>

        );

    }


    /*
     * =========================================
     * DASHBOARD / PROGRESS ERROR
     * =========================================
     */

    if (
        error &&
        (isDashboard || isProgress)
    ) {

        return (

            <div className="app-message error">

                {error}

            </div>

        );

    }


    /*
     * =========================================
     * DASHBOARD
     * =========================================
     */

    if (isDashboard) {

        /*
         * Never render Dashboard
         * with null data.
         */

        if (!data) {

            return (

                <div className="app-message">

                    Loading...

                </div>

            );

        }


        return (

            <FitFusionLayout
                user={data.user}
                onNavigate={navigate}
            >

                <Dashboard
                    dashboard={data}
                />

            </FitFusionLayout>

        );

    }


    /*
     * =========================================
     * PROGRESS
     * =========================================
     */

    if (isProgress) {

        /*
         * Never render ProgressDashboard
         * with null data.
         */

        if (!data) {

            return (

                <div className="app-message">

                    Loading...

                </div>

            );

        }


        return (

            <FitFusionLayout
                user={data.user}
                onNavigate={navigate}
            >

                <ProgressDashboard
                    progress={data}
                />

            </FitFusionLayout>

        );

    }


    /*
     * =========================================
     * WORKOUT HOME
     * =========================================
     */

    if (
        currentPage === "/workout/"
    ) {

        return (

            <FitFusionLayout
                user={workoutUser}
                onNavigate={navigate}
            >

                <WorkoutHome

                    onUserLoaded={(user) => {

                        setWorkoutUser(user);

                    }}


                    onWorkoutStarted={(sessionId) => {

                        navigate(
                            `/workout/session/${sessionId}/`
                        );

                    }}

                />

            </FitFusionLayout>

        );

    }


    /*
     * =========================================
     * WORKOUT COMPLETED
     * =========================================
     */

    if (
        currentPage.startsWith(
            "/workout/session/"
        ) &&
        currentPage.endsWith(
            "/completed/"
        )
    ) {

        return (

            <FitFusionLayout
                user={workoutUser}
                onNavigate={navigate}
            >

                <WorkoutCompleted

                    onBackToWorkout={() => {

                        navigate(
                            "/workout/"
                        );

                    }}

                />

            </FitFusionLayout>

        );

    }


    /*
     * =========================================
     * WORKOUT SESSION
     * =========================================
     */

    if (
        currentPage.startsWith(
            "/workout/session/"
        )
    ) {

        const sessionPath =
            currentPage
                .replace(
                    "/workout/session/",
                    ""
                )
                .replace(
                    "/",
                    ""
                );


        const sessionId =
            Number(sessionPath);


        if (
            Number.isNaN(sessionId)
        ) {

            return (

                <div className="app-message error">

                    Invalid workout session.

                </div>

            );

        }


        return (

            <FitFusionLayout
                user={workoutUser}
                onNavigate={navigate}
            >

                <WorkoutSession

                    sessionId={sessionId}

                    onWorkoutCompleted={() => {

                        navigate(
                            `/workout/session/${sessionId}/completed/`
                        );

                    }}

                />

            </FitFusionLayout>

        );

    }


    /*
     * =========================================
     * DIET
     * =========================================
     */

    if (isDiet) {

        return (

            <FitFusionLayout
                user={dietUser}
                onNavigate={navigate}
            >

                <DietHome

                    onUserLoaded={(user) => {

                        setDietUser(user);

                    }}

                />

            </FitFusionLayout>

        );

    }


    /*
     * =========================================
     * PROFILE
     * =========================================
     */

    if (isProfile) {

        return (

            <FitFusionLayout
                user={profileUser}
                onNavigate={navigate}
            >

                <Profile

                    onUserLoaded={(user) => {

                        setProfileUser(user);

                    }}

                />

            </FitFusionLayout>

        );

    }


    /*
     * =========================================
     * WATER TRACKER
     * =========================================
     */

   if (isTracker) {

    return (

        <FitFusionLayout
            user={trackerUser}
            onNavigate={navigate}
        >

            <WaterTracker
                onUserLoaded={(user) => {

                    setTrackerUser(user);

                }}
            />

        </FitFusionLayout>

    );

}


    /*
     * =========================================
     * FALLBACK
     * =========================================
     */

    return (

        <div className="app-message">

            <div>

                <h2>
                    Page not found
                </h2>

                <button
                    onClick={() => {
                        navigate("/");
                    }}
                >
                    Go to Progress
                </button>

            </div>

        </div>

    );

}


export default App;