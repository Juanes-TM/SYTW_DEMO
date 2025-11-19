// client/src/pages/dashboard/paciente/citas/ReservarCitaPage.jsx
import { useEffect, useState } from "react";
import api from "../../../../services/api";
import SelectorCitaCalendar from "../../../../components/SelectorCitaCalendar";

export default function ReservarCitaPage() {
  const [fisios, setFisios] = useState([]);
  const [fisioId, setFisioId] = useState("");

  useEffect(() => {
    const cargarFisioterapeutas = async () => {
      try {
        // ⭐ RUTA CORRECTA DEFINITIVA
        const res = await api.get("/api/fisioterapeutas");

        setFisios(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error cargando fisioterapeutas:", err);
        setFisios([]);
      }
    };

    cargarFisioterapeutas();
  }, []);

  const reservar = async (slot) => {
    try {
      await api.post("/api/citas", {
        fisioterapeutaId: fisioId,
        startAt: slot.startAt,
        durationMinutes: 60,
        motivo: "Cita reservada por el paciente",
      });

      alert("Cita reservada correctamente.");
    } catch (err) {
      console.error(err);
      alert("No se pudo reservar la cita.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-teal-700 mb-4">
        Reservar Cita
      </h1>

      <div className="mb-6 max-w-md">
        <label className="block mb-1 text-sm font-medium">
          Fisioterapeuta
        </label>

        <select
          value={fisioId}
          onChange={(e) => setFisioId(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg w-full text-sm"
        >
          <option value="">Selecciona un fisio...</option>

          {fisios.map((f) => (
            <option key={f._id} value={f._id}>
              {f.nombre} {f.apellido}
            </option>
          ))}
        </select>
      </div>

      {fisioId ? (
        <SelectorCitaCalendar
          fisioId={fisioId}
          onSlotSelected={reservar}
        />
      ) : (
        <p className="text-gray-500 text-sm">
          Selecciona un fisioterapeuta para ver disponibilidad.
        </p>
      )}
    </div>
  );
}
