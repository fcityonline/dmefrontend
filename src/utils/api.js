// frontend/src/utils/api.js
import axios from "axios";

// Dynamic API URL detection for production
const getAPIURL = () => {
  // Use environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // For production (cloudflared tunnel), use current hostname
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // If port exists and not standard ports, include it
  if (port && port !== '80' && port !== '443' && port !== '3000') {
    return `${protocol}//${hostname}:${port}/api`;
  }
  
  // For cloudflared tunnel (no port in URL), use same hostname
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Production: assume backend on same domain or port 5000
    // If backend is on different port, set REACT_APP_API_URL env var
    return `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
  }
  
  // Development fallback
  return "http://localhost:5000/api";
};

const API_URL = getAPIURL();
// const API_URL =
//   process.env.REACT_APP_API_URL ||
//   "https://api.dailymindeducation.com/api";


// Log the API URL for debugging
console.log("🌐 API Base URL:", API_URL);

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Axios interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🚨 API Error:", error?.response || error);

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Network error occurred. Please try again.";

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (!["/login", "/register"].includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default API;