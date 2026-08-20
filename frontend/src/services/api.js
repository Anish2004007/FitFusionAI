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
   WORKOUT API
========================================= */

export const getWorkout = async () => {

    const response = await api.get(
        "/workout/api/"
    );

    return response.data;

};


export const getWorkoutSession = async (
    sessionId
) => {

    const response = await api.get(
        `/workout/api/session/${sessionId}/`
    );

    return response.data;

};


export const startWorkout = async () => {

    const response = await api.post(
        "/workout/api/start/",
        {},
        {
            withCredentials: true,
        }
    );

    return response.data;

};


export const completeExercise = async (
    sessionId,
    exerciseId
) => {

    const response = await api.post(
        `/workout/api/session/${sessionId}/exercise/${exerciseId}/complete/`,
        {},
        {
            withCredentials: true,
        }
    );

    return response.data;

};


export const completeWorkout = async (
    sessionId
) => {

    const response = await api.post(
        `/workout/api/session/${sessionId}/complete/`,
        {},
        {
            withCredentials: true,
        }
    );

    return response.data;

};


export const getWorkoutCompleted = async (
    sessionId
) => {

    const response = await api.get(
        `/workout/api/session/${sessionId}/completed/`
    );

    return response.data;

};


/* =========================================
   DIET API
========================================= */

export const getDiet = async () => {

    const response = await api.get(
        "/diet/api/"
    );

    return response.data;

};


/* =========================================
   COMPLETE / UNCOMPLETE MEAL
========================================= */

export const completeMeal = async (
    mealId
) => {

    const response = await api.post(
        `/diet/api/meal/${mealId}/complete/`
    );

    return response.data;

};


export default api;