import { useState, useEffect } from "react";
import api from "../services/api";

export function useIntervalosLibres(fisioId, fecha, duracion = 30) {
  const [intervalos, setIntervalos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fisioId || !fecha) return;

    const cargar = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/disponibilidad/intervalos?fisioId=${fisioId}&fecha=${fecha}&duracion=${duracion}`
        );
        setIntervalos(res.data.intervalosLibres);
      } catch (err) {
        console.error("Error cargando intervalos libres:", err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [fisioId, fecha, duracion]);

  return { intervalos, loading };
}
