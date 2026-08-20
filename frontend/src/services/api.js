import axios from "axios";


const api = axios.create({
    baseURL: "http://localhost:8000",

    // Send Django session cookie with every request
    withCredentials: true,
});


/* =========================================
   PROGRESS API
========================================= */

export const getProgress = async () => {

    const response = await api.get(
        "/progress/api/"
    );

    return response.data;
};


/* =========================================
   DASHBOARD API
========================================= */

export const getDashboard = async () => {

    const response = await api.get(
        "/dashboard/api/"
    );

    return response.data;
};


export default api;