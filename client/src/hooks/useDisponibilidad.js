// client/src/hooks/useDisponibilidad.js
import { useEffect, useState } from "react";
import api from "../services/api";

export function useDisponibilidad(fisioId) {
  const [semana, setSemana] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ────────────────────────────────
  // CARGAR SEMANA
  // ────────────────────────────────
  useEffect(() => {
    if (!fisioId) return;

    const cargar = async () => {
      try {
        // IMPORTANTE: /api/disponibilidad/...
        const res = await api.get(`/api/disponibilidad/semana/${fisioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSemana(res.data);
      } catch (err) {
        console.error("Error al cargar disponibilidad semanal:", err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [fisioId]);

  // ────────────────────────────────
  // GUARDAR SEMANA
  // ────────────────────────────────
  const guardarSemana = async (horarios) => {
    try {
      // El backend espera un objeto dias { lunes: [...], martes: [...], ... }
      const payload = { dias: horarios };

      const res = await api.put(`/api/disponibilidad/semana`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSemana(res.data.disponibilidad);
      return res;
    } catch (err) {
      console.error("Error al guardar disponibilidad:", err);
      throw err;
    }
  };

  return { semana, loading, guardarSemana };
}
