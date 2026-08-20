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

import FitFusionLayout from "./components/FitFusionLayout";

import "./App.css";


function App() {

    const [page, setPage] = useState(
        window.location.pathname
    );

    const [data, setData] = useState(null);

    const [workoutUser, setWorkoutUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =========================================
       ROUTE DETECTION
    ========================================= */

    useEffect(() => {

        const handleLocationChange = () => {

            setPage(
                window.location.pathname
            );

        };


        window.addEventListener(
            "popstate",
            handleLocationChange
        );


        return () => {

            window.removeEventListener(
                "popstate",
                handleLocationChange
            );

        };

    }, []);


    /* =========================================
       RESET DATA WHEN PAGE CHANGES
    ========================================= */

    useEffect(() => {

        setData(null);

        setError("");

        setLoading(true);

    }, [page]);


    /* =========================================
       LOAD DASHBOARD / PROGRESS DATA
    ========================================= */

    useEffect(() => {

        const loadData = async () => {

            /*
             * Workout pages have their own
             * API calls.
             */

            if (
                page === "/workout/" ||
                page === "/workout" ||
                page.startsWith("/workout/session/")
            ) {

                setLoading(false);

                return;

            }


            try {

                let result;


                if (
                    page === "/dashboard/" ||
                    page === "/dashboard"
                ) {

                    result = await getDashboard();

                } else {

                    result = await getProgress();

                }


                if (result.success) {

                    setData(result);

                } else {

                    setError(
                        result.error ||
                        "Unable to load data."
                    );

                }

            } catch (error) {

                console.error(error);

                setError(
                    "Unable to connect to Django."
                );

            } finally {

                setLoading(false);

            }

        };


        loadData();

    }, [page]);


    /* =========================================
       NAVIGATION HELPER
    ========================================= */

    const navigate = (url) => {

        window.history.pushState(
            {},
            "",
            url
        );

        setPage(url);

    };


    /* =========================================
       DASHBOARD / PROGRESS LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="app-message">

                Loading...

            </div>

        );

    }


    /* =========================================
       DASHBOARD / PROGRESS ERROR
    ========================================= */

    if (
        error &&
        !page.startsWith("/workout")
    ) {

        return (

            <div className="app-message error">

                {error}

            </div>

        );

    }


    /* =========================================
       WORKOUT HOME
    ========================================= */

    if (
        page === "/workout/" ||
        page === "/workout"
    ) {

        return (

            <FitFusionLayout user={workoutUser}>

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


   /* =========================================
   WORKOUT COMPLETED
========================================= */

if (
    page.startsWith("/workout/session/") &&
    page.endsWith("/completed/")
) {

    return (

        <FitFusionLayout user={workoutUser}>

    <WorkoutCompleted
        workout={data}

        onUserLoaded={(user) => {
            setWorkoutUser(user);
        }}

        onBackToWorkout={() => {

            navigate(
                "/workout/"
            );

        }}
    />

</FitFusionLayout>

    );

}


/* =========================================
   WORKOUT SESSION
========================================= */

if (
    page.startsWith("/workout/session/")
) {

    const sessionPath =
        page
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


    if (Number.isNaN(sessionId)) {

        return (

            <div className="app-message error">

                Invalid workout session.

            </div>

        );

    }


    return (

       <FitFusionLayout user={workoutUser}>

    <WorkoutSession
        sessionId={sessionId}

        onUserLoaded={(user) => {
            setWorkoutUser(user);
        }}

        onWorkoutCompleted={() => {

            navigate(
                `/workout/session/${sessionId}/completed/`
            );

        }}
    />

</FitFusionLayout>

    );

}


    /* =========================================
       DASHBOARD
    ========================================= */

    if (
        page === "/dashboard/" ||
        page === "/dashboard"
    ) {

        return (

            <FitFusionLayout
                user={data?.user}
            >

                <Dashboard
                    dashboard={data}
                />

            </FitFusionLayout>

        );

    }


    /* =========================================
       PROGRESS
    ========================================= */

    return (

        <FitFusionLayout
            user={data?.user}
        >

            <ProgressDashboard
                progress={data}
            />

        </FitFusionLayout>

    );

}


export default App;