import { useEffect, useState } from "react";
import api from "../services/api";

export const useFisioterapeutas = () => {
  const [fisios, setFisios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/fisioterapeutas")
      .then(res => setFisios(res.data))
      .catch(err => console.error("Error al cargar fisioterapeutas:", err))
      .finally(() => setLoading(false));
  }, []);

  return { fisios, loading };
};
