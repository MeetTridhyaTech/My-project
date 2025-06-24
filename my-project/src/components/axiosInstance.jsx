import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor - Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const accessToken = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await axios.post(`${API_BASE_URL}/referesh-token`, {
            accessToken,
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          // Save new tokens
          localStorage.setItem("token", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err) => {
            reject(err);
          },
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
