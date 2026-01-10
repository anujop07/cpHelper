import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ✅ This runs BEFORE every request
API.interceptors.request.use(function(config) {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  // If token exists, add it to the request header
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  
  return config;
});

export default API;