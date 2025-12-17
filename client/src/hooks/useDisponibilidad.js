import { useEffect, useState } from "react";
import api from "../services/api";

const DIAS_SEMANA_ORDENADOS = [
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
];

export function useDisponibilidad(fisioId) {
  const [semana, setSemana] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ────────────────────────────────
  // CARGAR SEMANA
  // ────────────────────────────────
  useEffect(() => {
    if (!fisioId) return;

    const cargar = async () => {
      // OBTENER EL TOKEN FRESCO ANTES DE LA LLAMADA
      const token = localStorage.getItem("token");
      setLoading(true);
      
      try {
        if (!token) throw new Error("Token no encontrado. Acceso no autorizado.");

        const res = await api.get(`/api/disponibilidad/semana/${fisioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSemana(res.data);
      } catch (err) {
        console.error("Error al cargar disponibilidad semanal (401 probable):", err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [fisioId]);

  // ────────────────────────────────
  // GUARDAR SEMANA
  // ────────────────────────────────
  const guardarSemana = async (horariosDict) => {
    try {
      // OBTENER EL TOKEN FRESCO ANTES DE LA LLAMADA
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token no encontrado. No se puede guardar.");
        
      // 1. Transformar el diccionario (frontend) al array (backend)
      const diasArray = DIAS_SEMANA_ORDENADOS.map(dia => ({
          nombre: dia,
          horas: horariosDict[dia] || []
      }));
      
      // 2. Construir el payload que el backend espera: { dias: [...] }
      const payload = { dias: diasArray };

      const res = await api.put(`/api/disponibilidad/semana`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSemana({ dias: res.data.disponibilidad.dias, fisio: fisioId });
      return res;
    } catch (err) {
      console.error("Error al guardar disponibilidad (401 probable):", err);
      throw err;
    }
  };

  return { semana, loading, guardarSemana };
}