// client/src/pages/dashboard/paciente/citas/reserva/modals/ConfirmacionModal.jsx

import { useState, useEffect } from "react";

export default function ConfirmacionModal({ isOpen, onClose, onConfirm, datos, loading }) {
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMotivo("");
      setObservaciones("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!motivo.trim()) {
      setError("Por favor, indica el motivo de la consulta.");
      return;
    }
    onConfirm({ motivo, observaciones });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 animate-fade-in">
        
        <div className="bg-teal-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Confirmar Reserva</h3>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-2">
            <p className="text-sm text-teal-800"><strong>Fisioterapeuta:</strong> {datos.fisioNombre}</p>
            <p className="text-sm text-teal-800"><strong>Fecha:</strong> {datos.fechaLegible}</p>
            <p className="text-sm text-teal-800"><strong>Hora:</strong> {datos.hora}</p>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 text-sm">
            <span className="text-xl">⏱</span>
            <p className="mt-0.5">La sesión tiene una duración de <strong>60 minutos</strong>.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border rounded-lg px-3 py-2 outline-none ${
                  error ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-teal-500"
                }`}
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setError("");
                }}
                placeholder="Ej. Dolor lumbar, revisión..."
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 resize-none"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Información adicional..."
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium" disabled={loading}>Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-md ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? "Reservando..." : "Confirmar Cita"}
          </button>
        </div>
      </div>
    </div>
  );
}