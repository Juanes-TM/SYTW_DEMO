// src/services/api.js
import axios from "axios";

// URL REAL DEL BACKEND
// OBLIGATORIO poner /api porque tu backend expone todo bajo /api/*
const API_URL = import.meta.env.VITE_API_URL || "https://10.6.131.134/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Inyectar token automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
