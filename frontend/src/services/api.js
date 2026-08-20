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


/* =========================================
   WORKOUT HOME API
========================================= */

export const getWorkout = async () => {

    const response = await api.get(
        "/workout/api/"
    );

    return response.data;

};


/* =========================================
   START WORKOUT API
========================================= */

export const startWorkout = async () => {

    const response = await api.post(
        "/workout/api/start/"
    );

    return response.data;

};


/* =========================================
   WORKOUT SESSION API
========================================= */

export const getWorkoutSession = async (
    sessionId
) => {

    const response = await api.get(
        `/workout/api/session/${sessionId}/`
    );

    return response.data;

};


/* =========================================
   COMPLETE EXERCISE API
========================================= */

export const completeExercise = async (
    sessionId,
    exerciseId
) => {

    const response = await api.post(
        `/workout/api/session/${sessionId}/exercise/${exerciseId}/complete/`
    );

    return response.data;

};


/* =========================================
   COMPLETE WORKOUT API
========================================= */

export const completeWorkout = async (
    sessionId
) => {

    const response = await api.post(
        `/workout/api/session/${sessionId}/complete/`
    );

    return response.data;

};


export default api;