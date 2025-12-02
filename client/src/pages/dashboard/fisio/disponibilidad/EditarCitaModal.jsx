// client/src/pages/dashboard/fisio/disponibilidad/EditarCitaModal.jsx
import { useState } from 'react';
import api from '../../../../services/api'; 

export default function EditarCitaModal({ visible, onClose, cita, onUpdate }) {
  if (!visible || !cita) return null;

  const [loading, setLoading] = useState(false);

  // Colores según estado
  let headerColor = "bg-indigo-600";
  let badgeColor = "bg-indigo-100 text-indigo-800";

  if (cita.estado === 'cancelada') {
    headerColor = "bg-gray-500";
    badgeColor = "bg-red-100 text-red-700 line-through";
  } else if (cita.estado === 'completada') {
    headerColor = "bg-emerald-600";
    badgeColor = "bg-emerald-100 text-emerald-800";
  }

  // --- ACCIÓN: CAMBIAR ESTADO ---
  const cambiarEstado = async (nuevoEstado) => {
    // Mensaje de confirmación personalizado
    const mensaje = nuevoEstado === 'cancelada' 
      ? "¿Seguro que quieres CANCELAR esta cita? Se enviará una notificación automática al paciente."
      : `¿Marcar esta cita como ${nuevoEstado}?`;

    if (!window.confirm(mensaje)) return;

    try {
      setLoading(true);
      // PUT al backend (tu backend ya maneja la notificación si es 'cancelada')
      const res = await api.put(`/api/citas/${cita._id}/estado`, { estado: nuevoEstado });
      
      alert(`Cita actualizada: ${nuevoEstado}`);
      
      // Notificar al padre para que recargue la lista/calendario
      if (onUpdate) onUpdate(res.data.cita);
      onClose();

    } catch (error) {
      console.error("Error al gestionar cita:", error);
      alert(error.response?.data?.msg || "Hubo un error al actualizar la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-96 shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* HEADER */}
        <div className={`${headerColor} px-6 py-4 flex justify-between items-center transition-colors`}>
           <h3 className="text-white font-bold text-lg">Gestionar Cita</h3>
           <span className="text-white/80 text-xs font-mono uppercase tracking-wider">
             #{cita._id.slice(-6)}
           </span>
        </div>

        <div className="p-6 space-y-4">
          
          {/* DATOS DEL PACIENTE */}
          <div className="flex justify-between items-start">
             <div>
                <p className="text-sm text-gray-500 font-medium">Paciente</p>
                <p className="text-gray-900 font-bold text-lg leading-tight">
                  {cita.paciente?.nombre 
                    ? `${cita.paciente.nombre} ${cita.paciente.apellido}`
                    : 'Paciente'}
                </p>
                {cita.paciente?.email && (
                  <p className="text-xs text-gray-400 mt-1">{cita.paciente.email}</p>
                )}
             </div>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeColor}`}>
                {cita.estado}
             </span>
          </div>

          {/* FECHA Y HORA */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
             <div className="text-center w-1/2 border-r border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-bold">Fecha</p>
                <p className="text-gray-800 font-bold text-lg">
                    {new Date(cita.startAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short'})}
                </p>
             </div>
             <div className="text-center w-1/2">
                <p className="text-xs text-gray-500 uppercase font-bold">Hora</p>
                <p className="text-teal-600 font-bold text-lg">
                    {new Date(cita.startAt).toLocaleTimeString('es-ES', {hour: "2-digit", minute: "2-digit"})}
                </p>
             </div>
          </div>
          
          {/* MOTIVO */}
          <div className="pt-2">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Motivo</p>
            <p className="text-sm text-gray-700 italic border-l-4 border-indigo-200 pl-3">
              {cita.motivo}
            </p>
          </div>

          {/* === BOTONES DE ACCIÓN (SOLO SI NO ESTÁ CANCELADA) === */}
          {cita.estado !== 'cancelada' && (
             <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                
                {/* 1. MARCAR COMPLETADA */}
                {cita.estado !== 'completada' && (
                    <button
                        onClick={() => cambiarEstado('completada')}
                        disabled={loading}
                        className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg shadow transition disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : '✓ Marcar Completada'}
                    </button>
                )}

                {/* 2. CANCELAR */}
                <button
                  onClick={() => cambiarEstado('cancelada')}
                  disabled={loading}
                  className="col-span-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : '✕ Cancelar Cita'}
                </button>
             </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}