import { useEffect, useState } from "react";
import api from "../services/api";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/usuarios")
      .then(res => setUsuarios(res.data))
      .catch(err => console.error("Error al cargar usuarios:", err))
      .finally(() => setLoading(false));
  }, []);

  return { usuarios, loading };
};
