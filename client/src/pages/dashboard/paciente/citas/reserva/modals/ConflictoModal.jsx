//client/src/pages/dashboard/paciente/citas/reserva/modals/ConflictoModal.jsx

export default function ConflictoModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 transform scale-100 animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-bold text-gray-900">Horario No Disponible</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message}
            </p>
            <p className="text-xs text-red-500 mt-2 font-semibold">
              El calendario se ha actualizado para reflejar los cambios.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors sm:w-auto sm:text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}