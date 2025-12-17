//client/src/pages/dashboard/paciente/citas/CrearCitasModal.jsx
import { useState } from "react";
import api from "../../../../services/api";

export default function CrearCitaModal({ visible, onClose, slot, onCreated }) {
  if (!visible || !slot) return null;

  const { fecha, hora, fisioterapeutaId, fisioterapeutaNombre } = slot;

  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const buildStartAt = () => {
    return new Date(`${fecha}T${hora}:00`);
  };

  const crearCita = async () => {
    setError("");

    if (!motivo.trim()) {
      setError("El motivo es obligatorio");
      return;
    }

    try {
      setLoading(true);

      const startAt = buildStartAt();

      const body = {
        fisioterapeutaId,
        startAt,
        durationMinutes: 60,
        motivo,
        observaciones
      };

      const res = await api.post("/api/citas", body);

      onCreated(res.data.cita);
      onClose();

    } catch (err) {
      console.error("ERROR CREAR CITA:", err?.response?.data || err);
      setError("No se pudo crear la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Confirmar cita</h2>

        <div className="text-sm mb-4">
          <p><strong>Fisioterapeuta:</strong> {fisioterapeutaNombre}</p>
          <p><strong>Fecha:</strong> {fecha}</p>
          <p><strong>Hora:</strong> {hora}</p>
          <p><strong>Duración:</strong> 60 minutos</p>
        </div>

        <label className="block text-sm font-medium mb-1">Motivo*</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded-lg mb-4"
          placeholder="Motivo de la consulta"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">Observaciones</label>
        <textarea
          className="w-full border px-3 py-2 rounded-lg h-24"
          placeholder="Notas adicionales"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            onClick={crearCita}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            {loading ? "Creando..." : "Crear cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
