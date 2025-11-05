import { useEffect, useState } from "react";
import api from "../services/api";

export const useDisponibilidad = (fisioId) => {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisponibilidades = async () => {
    if (!fisioId) return;
    const res = await api.get(`/disponibilidades?fisioId=${fisioId}`);
    setDisponibilidades(res.data);
    setLoading(false);
  };

  const agregarDisponibilidad = async (fecha, horas) => {
    await api.post("/disponibilidades", { fisioId, fecha, horas });
    await fetchDisponibilidades();
  };

  const eliminarDisponibilidad = async (id) => {
    await api.delete(`/disponibilidades/${id}`);
    await fetchDisponibilidades();
  };

  useEffect(() => {
    fetchDisponibilidades();
  }, [fisioId]);

  return { disponibilidades, loading, agregarDisponibilidad, eliminarDisponibilidad };
};
