// src/services/intervalosService.js
import api from "./api";

export const obtenerIntervalosLibres = async (fisioId, fecha, duracion) => {
  const res = await api.get(
    `/disponibilidad/intervalos?fisioId=${fisioId}&fecha=${fecha}&duracion=${duracion}`
  );
  return res.data;
};
