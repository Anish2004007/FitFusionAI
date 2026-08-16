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