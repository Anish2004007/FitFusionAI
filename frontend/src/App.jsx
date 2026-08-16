import { useEffect, useState } from "react";

import { getProgress, getDashboard } from "./services/api";

import ProgressDashboard from "./components/ProgressDashboard";
import Dashboard from "./components/Dashboard";
import FitFusionLayout from "./components/FitFusionLayout";

import "./App.css";


function App() {

    const [page, setPage] = useState(
        window.location.pathname
    );

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        const loadData = async () => {

            try {

                let result;

                if (page === "/dashboard/" || page === "/dashboard") {

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


    if (loading) {

        return (
            <div className="app-message">
                Loading...
            </div>
        );

    }


    if (error) {

        return (
            <div className="app-message error">
                {error}
            </div>
        );

    }


    /*
     * =========================
     * DASHBOARD
     * =========================
     */

    if (
        page === "/dashboard/" ||
        page === "/dashboard"
    ) {

        return (

            <FitFusionLayout user={data.user}>

                <Dashboard
                    dashboard={data}
                />

            </FitFusionLayout>

        );

    }


    /*
     * =========================
     * PROGRESS
     * =========================
     */

    return (

        <FitFusionLayout user={data.user}>

            <ProgressDashboard
                progress={data}
            />

        </FitFusionLayout>

    );

}


export default App;