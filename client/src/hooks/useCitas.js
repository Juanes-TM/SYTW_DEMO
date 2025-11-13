import { useEffect, useState } from "react";
import api from "../services/api";

export const useCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/citas")
      .then(res => setCitas(res.data))
      .catch(err => console.error("Error al cargar citas:", err))
      .finally(() => setLoading(false));
  }, []);

  return { citas, loading };
};
