import { useEffect, useState } from "react";
import api from "../services/api";

export default function FisioSelector({ onSelect }) {
  const [fisios, setFisios] = useState([]);

  useEffect(() => {
    api.get("/usuarios?rol=therapist").then((res) => setFisios(res.data));
  }, []);

  return (
    <select
      onChange={(e) => onSelect(e.target.value)}
      className="border p-2 rounded-md text-gray-700"
    >
      <option value="">Seleccionar fisioterapeuta...</option>
      {fisios.map((fisio) => (
        <option key={fisio.id} value={fisio.id}>
          {fisio.nombre}
        </option>
      ))}
    </select>
  );
}
