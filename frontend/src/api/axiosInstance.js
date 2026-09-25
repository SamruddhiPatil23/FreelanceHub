// api/axiosInstance.js
// Purpose: one shared axios instance so we don't repeat the base URL everywhere,
// and so every request automatically carries the JWT if the user is logged in.

import axios from "axios";

// Backend root (no /api) — used to build full URLs for static files like
// uploaded profile images: `${BACKEND_URL}/uploads/<filename>`
export const BACKEND_URL = "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Runs before every request: attach token from localStorage, if present.
axiosInstance.interceptors.request.use((config) => {
  const userData = localStorage.getItem("fh_user");
  if (userData) {
    const { token } = JSON.parse(userData);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Runs on every response: if token is invalid/expired (401), log the user out.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("fh_user");
      // Full reload sends user back to a clean login state.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
