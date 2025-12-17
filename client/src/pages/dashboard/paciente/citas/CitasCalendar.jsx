//client/src/pages/dashboard/paciente/citas/CitasCalendar.jsx
import { useEffect, useState } from "react";
import api from "../../../../services/api";
import { useFisioterapeutas } from "../../../../hooks/useFisioterapeutas";
import EditarCitaModal from "./EditarCitaModal"; 
import CitaModal from "./CitaModal";
import ListaCitasDiaModal from "./ListaCitasDiaModal"; 
import CancelarModal from "./CancelarModal";

// ----------------------
// Helpers
// ----------------------
function getPrimerDiaMes(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

function esMismoDia(d1, d2) {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
}

// ----------------------
// Calendario Histórico Mensual
// ----------------------
export default function CitasCalendar({ modo }) {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("fisioUser") || "{}").user || {};
  
  const fechaRegistro = currentUser.createdAt ? new Date(currentUser.createdAt) : new Date(2024, 0, 1); 

  // Estado
  const [fechaActual, setFechaActual] = useState(getPrimerDiaMes(new Date())); 
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalType, setModalType] = useState(null); // 'DETALLE' | 'EDITAR'
  const [cancelling, setCancelling] = useState(false);
  
  const [citasDelDia, setCitasDelDia] = useState([]);
  const [listaDiaModalOpen, setListaDiaModalOpen] = useState(false);
  
  // Estado para el modal de CANCELACIÓN
  const [modalConfirmCancelOpen, setModalConfirmCancelOpen] = useState(false);
  const [citaIdToCancel, setCitaIdToCancel] = useState(null);
  
  const [refreshFlag, setRefreshFlag] = useState(0);


  // 1. Fetch Citas
  const fetchCitas = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/citas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCitas(res.data);
    } catch (err) {
      console.error("Error cargando citas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [token, refreshFlag]);

  // ----------------------
  // Navegación y Lógica Mensual
  // ----------------------
  const getDiasMes = (fecha) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDiaMes = new Date(año, mes, 1);
    const ultimoDiaMes = new Date(año, mes + 1, 0);
    const dias = [];
    
    // Relleno días previos
    let diaSemanaPrimerDia = primerDiaMes.getDay(); 
    if (diaSemanaPrimerDia === 0) diaSemanaPrimerDia = 7;
    for (let i = 1; i < diaSemanaPrimerDia; i++) {
        const d = new Date(año, mes, 1 - (diaSemanaPrimerDia - i));
        dias.push({ fecha: d, esMesActual: false });
    }
    
    // Días del mes actual
    for (let i = 1; i <= ultimoDiaMes.getDate(); i++) {
        dias.push({ fecha: new Date(año, mes, i), esMesActual: true });
    }
    
    // Relleno días posteriores
    while (dias.length % 7 !== 0) {
        const ultimo = dias[dias.length - 1].fecha;
        const d = new Date(ultimo);
        d.setDate(d.getDate() + 1);
        dias.push({ fecha: d, esMesActual: false });
    }
    return dias;
  };
  
  const cambiarMes = (dir) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + dir);
    
    // Validar no ir antes del mes de registro
    const limiteInferior = new Date(fechaRegistro.getFullYear(), fechaRegistro.getMonth(), 1);
    if (dir < 0 && nueva < limiteInferior) {
        return; 
    }
    setFechaActual(getPrimerDiaMes(nueva));
  };

  // ----------------------
  // Handlers
  // ----------------------
  const handleCitaClick = (e, cita) => {
    e.stopPropagation();
    setCitaSeleccionada(cita);
    
    if (modo === 'paciente') {
        setModalType('EDITAR'); 
    } else {
        setModalType('DETALLE'); 
    }
  };

  const handleVerMas = (e, diaObj) => {
    e.stopPropagation();
    const citasDia = citas.filter(c => esMismoDia(new Date(c.startAt), diaObj));
    setCitasDelDia(citasDia);
    setListaDiaModalOpen(true);
  }
  
  // === Refrescar citas tras editar ===
    const refrescarCitas = () => {
      setRefreshFlag(prev => prev + 1);
    };
  // 1. Inicia el flujo de confirmación de cancelación
  const handleRequestCancel = (citaId) => {
    setModalType(null); 
    setCitaIdToCancel(citaId);
    setModalConfirmCancelOpen(true);
  };
  
  // 2. Ejecuta la cancelación real
  const handleConfirmarCancelacion = async () => {
    if (!citaIdToCancel) return;
    
    setCancelling(true);
    try {
        const token = localStorage.getItem("token");
        await api.put(`/api/citas/${citaIdToCancel}/estado`, { estado: 'cancelada' }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        fetchCitas(); 
        setModalConfirmCancelOpen(false); // Cierra el modal de confirmación
    } catch (err) {
        alert("Error al cancelar cita: " + (err.response?.data?.msg || "Error desconocido"));
    } finally {
        setCancelling(false);
        setCitaIdToCancel(null);
    }
  };
  
  // Render
  const diasCalendario = getDiasMes(fechaActual);
  const mesStr = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const diaNombres = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

  const puedeIrAtras = fechaActual > getPrimerDiaMes(fechaRegistro);


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      <h1 className="text-3xl font-bold text-teal-700 mb-2">Calendario de Citas</h1>
      <p className="text-gray-600 text-sm mb-6">
        Revisa el historial completo de tus citas reservadas.
      </p>

      {loading ? (
        <p>Cargando calendario...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        
        {/* Controles Mes */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
            <button 
                onClick={() => cambiarMes(-1)} 
                disabled={!puedeIrAtras}
                className={`p-2 rounded-lg transition-colors ${!puedeIrAtras ? 'text-gray-300 cursor-not-allowed' : 'text-teal-700 hover:bg-gray-100'}`}
            >
                ← Mes Anterior
            </button>
            <h2 className="text-xl font-bold text-gray-800 capitalize">{mesStr}</h2>
            <button 
                onClick={() => cambiarMes(1)} 
                className="p-2 rounded-lg text-teal-700 hover:bg-gray-100 transition-colors"
            >
                Mes Siguiente →
            </button>
        </div>

        {/* Grid Calendario */}
        <div className="p-4">
            {/* Cabecera Semanal */}
            <div className="grid grid-cols-7 mb-2">
                {diaNombres.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-700 uppercase py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Días */}
            <div className="grid grid-cols-7 gap-1 lg:gap-2">
                {diasCalendario.map((diaInfo, i) => {
                    const citasDia = citas.filter(c => esMismoDia(new Date(c.startAt), diaInfo.fecha));
                    const limiteCitas = 2; // Mostrar solo 2 citas por defecto
                    const citasVisibles = citasDia.slice(0, limiteCitas);
                    const citasRestantes = citasDia.length - limiteCitas;
                    
                    return (
                        <div 
                            key={i} 
                            // Altura fija y scroll interno para citas
                            className={`h-[120px] md:h-[140px] border rounded-xl p-1 transition-colors flex flex-col
                                ${diaInfo.esMesActual ? 'bg-white border-gray-200' : 'bg-gray-50 border-transparent opacity-60'}
                            `}
                        >
                            <span className={`text-sm font-bold mb-1 px-1 ${esMismoDia(diaInfo.fecha, new Date()) ? 'text-teal-600' : 'text-gray-700'}`}>
                                {diaInfo.fecha.getDate()}
                            </span>

                            {/* Lista de Citas del Día con scroll limitado */}
                            <div className="flex flex-col gap-1 overflow-y-hidden">
                                {citasVisibles.map(cita => {
                                    let colorClass = "bg-teal-500 text-white border-teal-600 hover:bg-teal-600"; // Pendiente
                                    if (cita.estado === 'cancelada') colorClass = "bg-red-100 text-red-700 border-red-200 line-through decoration-red-400";
                                    if (cita.estado === 'completada') colorClass = "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600";
                                    
                                    const hora = new Date(cita.startAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

                                    return (
                                        <button
                                            key={cita._id}
                                            onClick={(e) => handleCitaClick(e, cita)}
                                            className={`text-left text-xs px-2 py-1 truncate font-medium rounded border w-full transition-all shadow-sm ${colorClass}`}
                                            title={`${hora} - ${cita.motivo}`}
                                        >
                                            {hora} - {cita.motivo}
                                        </button>
                                    )
                                })}
                            </div>
                            
                            {/* Botón Ver Más */}
                            {citasRestantes > 0 && (
                                <button
                                    onClick={(e) => handleVerMas(e, diaInfo.fecha)}
                                    className="text-xs text-teal-600 font-bold mt-1 hover:text-teal-800 transition-colors px-1"
                                >
                                    +{citasRestantes} más...
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
      )}

      {/* MODALES */}
      {modalType === 'EDITAR' && ( 
        <EditarCitaModal
          visible={true}
          cita={citaSeleccionada}
          onClose={() => setModalType(null)}
          onRequestCancel={handleRequestCancel}
          cancelling={cancelling}
          onUpdated={refrescarCitas}
        />
      )}
       {modalType === 'DETALLE' && ( 
        <CitaModal
          cita={citaSeleccionada}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Listado de Citas del Día */}
      {listaDiaModalOpen && (
        <ListaCitasDiaModal
            isOpen={listaDiaModalOpen}
            onClose={() => setListaDiaModalOpen(false)}
            citas={citasDelDia}
            onCitaSelect={handleCitaClick}
        />
      )}
      
      {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN */}
      {modalConfirmCancelOpen && (
        <CancelarModal 
          isOpen={true} 
          onClose={() => setModalConfirmCancelOpen(false)} 
          onConfirm={handleConfirmarCancelacion} 
          loading={cancelling} 
        />
      )}
    </div>
  );
}