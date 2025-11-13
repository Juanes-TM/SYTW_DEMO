import { useState } from "react";
import api from "../../../../services/api";

export default function CrearCitaModal({
  visible,
  onClose,
  fisioterapeutaId,
  fisioterapeutaNombre,
  fecha,  // string "YYYY-MM-DD"
  hora,   // string "HH:MM"
  onCreated
}) {
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!visible) return null;

  const handleCrear = async () => {
    if (!motivo.trim()) {
      setError("El motivo es obligatorio.");
      return;
    }

    setError("");
    setLoading(true);

    // Construimos un Date ISO a partir de fecha + hora
    const startAt = new Date(`${fecha}T${hora}:00`);

    try {
      const res = await api.post("/api/citas", {
        fisioterapeutaId,
        startAt,
        durationMinutes: 60, // duración fija de 1h
        motivo,
        observaciones,
      });

      if (onCreated) onCreated(res.data.cita);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Confirmar cita
        </h2>

        <p className="text-gray-600 mb-4">
          <strong>Fisioterapeuta:</strong> {fisioterapeutaNombre}
          <br />
          <strong>Fecha:</strong> {fecha}
          <br />
          <strong>Hora:</strong> {hora}
          <br />
          <strong>Duración:</strong> 60 minutos
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Motivo*</label>
            <input
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Dolor lumbar, sesión de seguimiento..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Observaciones</label>
            <textarea
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
              rows={2}
              placeholder="Notas adicionales..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 mt-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrear}
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
