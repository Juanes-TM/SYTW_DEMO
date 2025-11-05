import { useEffect, useState } from "react";
import api from "../../services/api";

const CitasPage = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/citas").then((res) => {
      setCitas(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="p-6">Cargando citas...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-teal-700 mb-4">📅 Citas</h2>
      {citas.length > 0 ? (
        <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
          <thead className="bg-teal-700 text-white">
            <tr>
              <th className="px-4 py-2">Paciente</th>
              <th className="px-4 py-2">Fisioterapeuta</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Hora</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr
                key={cita.id}
                className="border-t text-gray-700 hover:bg-gray-50"
              >
                <td className="px-4 py-2">{cita.paciente}</td>
                <td className="px-4 py-2">{cita.fisioterapeuta}</td>
                <td className="px-4 py-2">{cita.fecha}</td>
                <td className="px-4 py-2">{cita.hora}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay citas registradas.</p>
      )}
    </div>
  );
};

export default CitasPage;
