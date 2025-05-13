import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Attach Token Before Sending Request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found in localStorage!");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Unauthorized (401) Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized! Clearing token...");
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      window.location.href = "/login"; // Redirect to Login Page
    }
    return Promise.reject(error);
  }
);

export default api;
