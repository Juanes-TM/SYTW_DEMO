import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";

export default function EditarCitaModal({
  visible,
  onClose,
  cita,
  onRequestCancel, // Usado por el paciente
  cancelling,
  onUpdated,       // Callback para refrescar el calendario tras cambios del fisio
}) {
  if (!visible || !cita) return null;

  const navigate = useNavigate();

  // 1. DETECCIÓN DE ROL
  const userStorage = JSON.parse(localStorage.getItem("fisioUser") || "{}");
  const userRole = userStorage.user?.rol;
  
  const isFisio = userRole === "fisioterapeuta" || userRole === "admin";
  const isPaciente = userRole === "cliente";

  // --- ESTADOS ---
  const [motivo, setMotivo] = useState(cita.motivo || "");
  const [observaciones, setObservaciones] = useState(cita.observaciones || "");
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false); // Para acciones del Fisio
  const [error, setError] = useState("");

  useEffect(() => {
    setMotivo(cita.motivo || "");
    setObservaciones(cita.observaciones || "");
    setEditando(false);
    setError("");
    setLoadingAction(false);
  }, [cita]);

  // --- REGLAS DE VISUALIZACIÓN ---
  const isFuture = new Date(cita.startAt) > new Date();

  // PACIENTE:
  const puedeCancelarPaciente = isPaciente && (cita.estado === "pendiente" || cita.estado === "confirmada") && isFuture;
  const puedeValorar = isPaciente && cita.estado === "completada";
  
  const puedeEditarTexto = isPaciente && puedeCancelarPaciente;

  // FISIO: Puede gestionar siempre que no esté cancelada
  const puedeGestionarFisio = isFisio && cita.estado !== "cancelada";

  // COLORES
  let headerColor = "bg-indigo-600";
  let badgeColor = "bg-indigo-100 text-indigo-800";

  if (cita.estado === "cancelada") {
    headerColor = "bg-gray-500";
    badgeColor = "bg-red-100 text-red-700 line-through";
  } else if (cita.estado === "completada") {
    headerColor = "bg-emerald-600";
    badgeColor = "bg-emerald-100 text-emerald-800";
  }

  // --- FUNCIONES ---

  // Acción del Paciente
  const handleCancelarPaciente = () => {
    onRequestCancel(cita._id);
  };

  const irAValorar = () => {
    navigate(`/valorar/${cita.fisioterapeuta?._id || cita.fisioterapeuta}`);
  };

  const verOpiniones = () => {
    navigate(`/valoraciones/${cita.fisioterapeuta?._id || cita.fisioterapeuta}`);
  };

  // Guardar edición de texto
  const guardarTexto = async () => {
    if (!motivo.trim()) { setError("El motivo no puede estar vacío."); return; }
    setSaving(true);
    try {
      const res = await api.patch(`/api/citas/${cita._id}`, { motivo, observaciones });
      if (onUpdated) onUpdated(res.data.cita);
      setEditando(false);
    } catch (err) {
      console.error(err);
      setError("Error guardando cambios.");
    } finally {
      setSaving(false);
    }
  };

  // Acción del Fisio (Directa)
  const cambiarEstado = async (nuevoEstado) => {
    const msg = nuevoEstado === 'cancelada' 
      ? "¿Seguro que quieres CANCELAR esta cita? El paciente será notificado."
      : `¿Marcar cita como ${nuevoEstado}?`;

    if (!window.confirm(msg)) return;

    try {
      setLoadingAction(true);
      const res = await api.put(`/api/citas/${cita._id}/estado`, { estado: nuevoEstado });
      alert(`Cita actualizada a: ${nuevoEstado}`);
      
      if (onUpdated) onUpdated(res.data.cita); // Refresca calendario
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la cita.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-96 shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* HEADER */}
        <div className={"bg-teal-600 px-6 py-4 flex justify-between items-center"}>
          <h3 className="text-white font-bold text-lg">
            {isFisio ? "Gestionar Cita" : "Detalles Cita"}
          </h3>
          <span className="text-white/80 text-xs font-mono uppercase tracking-wider">#{cita._id.slice(-6)}</span>
        </div>

        <div className="p-6 space-y-4">
          
          {/* INFO PRINCIPAL */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {isFisio ? "Paciente" : "Fisioterapeuta"}
              </p>
              <p className="text-gray-900 font-bold text-lg leading-tight">
                {isFisio
                  ? `${cita.paciente?.nombre || "Paciente"} ${cita.paciente?.apellido || ""}`
                  : `${cita.fisioterapeuta?.nombre || "Fisio"} ${cita.fisioterapeuta?.apellido || ""}`}
              </p>
              {isPaciente && (
                <button onClick={verOpiniones} className="text-xs text-blue-600 hover:text-blue-800 underline mt-1">Ver opiniones</button>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeColor}`}>{cita.estado}</span>
          </div>

          {/* FECHA/HORA */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="text-center w-1/2 border-r border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-bold">Fecha</p>
              <p className="text-gray-800 font-bold text-lg">{new Date(cita.startAt).toLocaleDateString('es-ES', {day:'numeric', month:'short'})}</p>
            </div>
            <div className="text-center w-1/2">
              <p className="text-xs text-gray-500 uppercase font-bold">Hora</p>
              <p className="text-teal-600 font-bold text-lg">{new Date(cita.startAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
            </div>
          </div>

          {/* MOTIVO */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Motivo</p>
              {isPaciente && puedeCancelarPaciente && !editando && (
                <button onClick={() => setEditando(true)} className="text-xs text-blue-600 hover:text-blue-800 underline">Editar</button>
              )}
            </div>

            {!editando ? (
              <>
                <p className="text-sm text-gray-700 italic border-l-4 border-indigo-200 pl-3">{cita.motivo}</p>
                {cita.observaciones && <p className="text-xs text-gray-600 border-l-4 border-gray-200 pl-3 mt-1">{cita.observaciones}</p>}
              </>
            ) : (
              <>
                <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full border rounded p-2 text-sm mb-2" />
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="w-full border rounded p-2 text-sm h-20" placeholder="Notas" />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditando(false)} className="px-3 py-1 text-xs bg-gray-100 rounded border">Cancelar</button>
                  <button onClick={guardarTexto} disabled={saving} className="px-3 py-1 text-xs bg-teal-600 text-white rounded">{saving ? "..." : "Guardar"}</button>
                </div>
              </>
            )}
          </div>

          {/* === BOTONES FISIO === */}
          {puedeGestionarFisio && (
             <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                {cita.estado !== 'completada' && (
                    <button
                        onClick={() => cambiarEstado('completada')}
                        disabled={loadingAction}
                        className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg shadow transition disabled:opacity-50"
                    >
                        ✓ Marcar Completada
                    </button>
                )}
                <button
                  onClick={() => cambiarEstado('cancelada')}
                  disabled={loadingAction}
                  className="col-span-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loadingAction ? '...' : '✕ Cancelar Cita'}
                </button>
             </div>
          )}

          {/* === BOTONES PACIENTE (VALORAR) === */}
          {puedeValorar && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button onClick={irAValorar} className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl shadow-md">
                <span className="text-lg">★</span> Valorar Servicio
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm">
            Cerrar
          </button>

          {/* Botón Cancelar del Paciente (Solicitud) */}
          {puedeCancelarPaciente && (
            <button
              onClick={handleCancelarPaciente}
              disabled={cancelling}
              className={`px-4 py-2 rounded-lg bg-red-100 text-red-700 border border-red-200 font-semibold hover:bg-red-200 transition-all text-sm ${
                cancelling ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {cancelling ? "Cancelando..." : "Cancelar Cita"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}