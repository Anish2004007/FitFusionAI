import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
});

export const getProgress = async () => {
    const response = await api.get("/progress/api/");
    return response.data;
};

export default api;

export async function getDashboard() {

    const response = await fetch(
        "http://localhost:8000/dashboard/api/",
        {
            credentials: "include",
        }
    );

    if (!response.ok) {

        throw new Error(
            "Unable to load dashboard data."
        );

    }

    return await response.json();
}