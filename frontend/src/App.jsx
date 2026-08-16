import { useEffect, useState } from "react";

import { getProgress } from "./services/api";

import ProgressDashboard from "./components/ProgressDashboard";
import FitFusionLayout from "./components/FitFusionLayout";

import "./App.css";


function App() {

    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const loadProgress = async () => {

            try {

                const data = await getProgress();

                if (data.success) {

                    setProgress(data);

                } else {

                    setError(
                        data.error ||
                        "Unable to load progress."
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

        loadProgress();

    }, []);


    if (loading) {

        return (
            <div className="app-message">
                Loading Progress...
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


    return (
        <FitFusionLayout user={progress.user}>

            <ProgressDashboard
                progress={progress}
            />

        </FitFusionLayout>
    );
}


export default App;