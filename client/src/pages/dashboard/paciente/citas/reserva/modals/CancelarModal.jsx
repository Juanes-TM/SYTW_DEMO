// client/src/pages/dashboard/paciente/citas/reserva/modals/CancelarModal.jsx

export default function CancelarModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">

        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>

          <h3 className="text-lg font-bold text-gray-900">¿Cancelar Cita?</h3>

          <p className="text-sm text-gray-500 mt-2">
            ¿Seguro que quieres cancelar tu cita?
            <br />
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="bg-gray-50 px-4 py-3 flex flex-row-reverse gap-2">

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full inline-flex justify-center rounded-lg px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 ${
              loading ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {loading ? "Cancelando..." : "Sí, Cancelar"}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full inline-flex justify-center rounded-lg border px-4 py-2 bg-white text-gray-700 hover:bg-gray-50"
          >
            No, volver
          </button>

        </div>
      </div>
    </div>
  );
}