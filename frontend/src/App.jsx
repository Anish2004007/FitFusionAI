import { useEffect, useState } from "react";
import { getProgress } from "./services/api";

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
                        data.error || "Unable to load progress."
                    );
                }

            } catch (err) {

                console.error(err);

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
        return <h2>Loading Progress...</h2>;
    }


    if (error) {
        return <h2>{error}</h2>;
    }


    return (
        <div>

            <h1>FitFusion AI Progress</h1>

            <div>

                <h2>
                    Completed Workouts
                </h2>

                <p>
                    {progress.stats.total_workouts}
                </p>

            </div>


            <div>

                <h2>
                    This Week
                </h2>

                <p>
                    {progress.stats.weekly_workouts}
                </p>

            </div>


            <div>

                <h2>
                    Completion Rate
                </h2>

                <p>
                    {progress.stats.completion_rate}%
                </p>

            </div>


            <h2>
                Recent Workouts
            </h2>

            {progress.workout_history.map(
                (workout) => (

                    <div key={workout.id}>

                        <h3>
                            {workout.name}
                        </h3>

                        <p>
                            {new Date(
                                workout.completed_at
                            ).toLocaleString()}
                        </p>

                    </div>

                )
            )}

        </div>
    );
}

export default App;