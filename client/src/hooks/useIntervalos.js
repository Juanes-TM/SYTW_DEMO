// client/src/hooks/useIntervalos.js
import { useState } from "react";
import api from "../services/api";

export function useIntervalos() {
  const [intervalos, setIntervalos] = useState([]);
  const [loading, setLoading] = useState(false);

  async function cargarIntervalos(fisioId, fecha, duracion) {
    // Si falta algún dato, vaciamos y salimos
    if (!fisioId || !fecha || !duracion) {
      setIntervalos([]);
      return;
    }

    try {
      setLoading(true);

      // IMPORTANTE: siempre /api/...
      const res = await api.get("/api/disponibilidad/intervalos", {
        params: { fisioId, fecha, duracion },
      });

      const arr = res?.data?.intervalosLibres;
      setIntervalos(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error("Error cargando intervalos libres:", err);
      setIntervalos([]);
    } finally {
      setLoading(false);
    }
  }

  return { intervalos, loading, cargarIntervalos };
}
