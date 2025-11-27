// client/src/pages/dashboard/paciente/citas/reserva/modals/CancelarModal.jsx

export default function InfoCitaModal({ isOpen, onClose, cita, onRequestCancel }) {
  if (!isOpen || !cita) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Mi Cita Reservada</h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-6">

          <p className="text-lg font-medium text-gray-800">
            {new Date(cita.startAt).toLocaleDateString()} a las{" "}
            {new Date(cita.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>

          <div className="space-y-4">

            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Motivo</p>
              <div className="bg-gray-50 p-3 rounded-lg border text-gray-700 text-sm">{cita.motivo}</div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Observaciones</p>
              <div className="bg-gray-50 p-3 rounded-lg border text-gray-700 text-sm">
                {cita.observaciones || "Sin observaciones"}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Estado</p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  cita.estado === "confirmada"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {cita.estado}
              </span>
            </div>

          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-between border-t">

          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">
            Cerrar
          </button>

          {cita.estado !== "cancelada" && (
            <button
              onClick={() => onRequestCancel(cita._id)}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-sm"
            >
              Cancelar Cita
            </button>
          )}

        </div>
      </div>
    </div>
  );
}