// src/api/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
});

// ----------------------
// Usuarios
// ----------------------
export const getUsuarios = async () => {
  const res = await api.get("/usuarios");
  return res.data;
};

export const addUsuario = async (nuevoUsuario) => {
  const res = await api.post("/usuarios", nuevoUsuario);
  return res.data;
};

export const deleteUsuario = async (id) => {
  await api.delete(`/usuarios/${id}`);
};

// ----------------------
// Citas
// ----------------------
export const getCitasPaciente = async (paciente) => {
  const res = await api.get(`/citas?paciente=${paciente}`);
  return res.data;
};

export const addCita = async (nuevaCita) => {
  const res = await api.post("/citas", nuevaCita);
  return res.data;
};

export const completarCita = async (id, data) => {
  const res = await api.patch(`/citas/${id}`, data);
  return res.data;
};
