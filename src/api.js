// src/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "/";

// API endpoints that don't require Authorization token
const PUBLIC_API_ENDPOINTS = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Check if URL is a public API endpoint
const isPublicEndpoint = (url) => {
  return PUBLIC_API_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token for protected endpoints only
    if (!isPublicEndpoint(config.url)) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors
    if (error?.response?.status === 401) {
      const message = error.response.data?.error || "Unauthorized";

      if (message.includes("Token expired")) {
        // Dispatch custom event for centralized handling
        window.dispatchEvent(new Event("auth-logout"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;