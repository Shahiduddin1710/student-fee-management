import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/auth",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const login = (data) => API.post("/login", data);

export const signup = (data) => API.post("/register", data);

export const completeProfile = (data) =>
  API.put("/complete-profile", data);

export const enterPortal = (data) =>
  API.post("/enter-portal", data);

export const changePassword = (data) =>
  API.put("/change-password", data);