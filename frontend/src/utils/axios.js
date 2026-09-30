import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://firsthire-backend-2wco.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    config.headers.Authorization = `Bearer ${sessionId}`;
  }
  return config;
});

export default api;