import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDisponibilidad } from "../../hooks/useDisponibilidad";

export default function DisponibilidadPage() {
  const { user } = useSelector((state) => state.user);
  const [fisioId, setFisioId] = useState(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horas, setHoras] = useState([]);

  // 🧠 Obtener el ID del fisioterapeuta logueado
  useEffect(() => {
    if (!user?.user) return;
    fetch(`http://localhost:4000/usuarios?email=${user.user.toLowerCase()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.length > 0) {
          setFisioId(data[0].id);
        }
      })
      .catch((err) => console.error("Error al obtener fisioId:", err));
  }, [user]);

  const { disponibilidades, agregarDisponibilidad, eliminarDisponibilidad, loading } =
    useDisponibilidad(fisioId);

  const agregarHora = () => {
    if (hora && !horas.includes(hora)) {
      setHoras([...horas, hora]);
      setHora("");
    }
  };

  const guardarDisponibilidad = async () => {
    if (!fecha || horas.length === 0) {
      alert("Selecciona una fecha y al menos una hora");
      return;
    }
    await agregarDisponibilidad(fecha, horas);
    setFecha("");
    setHoras([]);
  };

  if (loading) return <p className="p-6">Cargando disponibilidad...</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-teal-700 mb-6">
        Configurar disponibilidad
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex flex-col gap-4">
          <label className="text-gray-700 font-medium">Selecciona una fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border p-2 rounded-md w-60"
          />

          <div>
            <label className="text-gray-700 font-medium">Añadir hora:</label>
            <div className="flex gap-2 mt-2">
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="border p-2 rounded-md w-40"
              />
              <button
                onClick={agregarHora}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md"
              >
                Añadir
              </button>
            </div>
          </div>

          {horas.length > 0 && (
            <div className="mt-3">
              <p className="text-gray-600 mb-2">Horas seleccionadas:</p>
              <div className="flex flex-wrap gap-2">
                {horas.map((h) => (
                  <span
                    key={h}
                    className="bg-teal-100 text-teal-700 px-3 py-1 rounded-lg text-sm"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={guardarDisponibilidad}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md self-start"
          >
            Guardar disponibilidad
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-teal-700 mb-3">Tus días publicados</h3>
      <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
        <thead className="bg-teal-700 text-white">
          <tr>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Horas</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {disponibilidades.map((d) => (
            <tr key={d.id} className="border-t text-gray-700">
              <td className="px-4 py-2">{d.fecha}</td>
              <td className="px-4 py-2">{d.horas.join(", ")}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => eliminarDisponibilidad(d.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
