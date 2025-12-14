// client/src/pages/dashboard/paciente/citas/reserva/ReservarCitaPage.jxs

import ConfirmacionModal from "./modals/ConfirmacionModal";
import CancelarModal from "./modals/CancelarModal";
import InfoCitaModal from "./modals/InfoCitaModal";
import ConflictoModal from "./modals/ConflictoModal";
import BuscadorFisios from "./BuscadorFisios"; 

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../../services/api";

// ==========================================
// PÁGINA PRINCIPAL: RESERVA DE CITAS
// ==========================================
export default function ReservarCitaPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- ESTADOS DE DATOS ---
  const [fisios, setFisios] = useState([]); // Lista completa fusionada
  const [fisiosFiltrados, setFisiosFiltrados] = useState([]);
  
  // ESTADOS DEL FILTRO
  const [filtros, setFiltros] = useState({
    texto: "",
    especialidad: "",
    minRating: 0
  });

  // ESTADO DE SELECCIÓN Y CALENDARIO
  const [fisioId, setFisioId] = useState(
    localStorage.getItem('lastFisioId') || ""
  );
  
  const [lunesSemana, setLunesSemana] = useState(getLunesActual());
  
  const [datosSemana, setDatosSemana] = useState({ 
    misCitas: [], 
    horarioBase: [],
    intervalosLibresMap: {} 
  });
  
  const [loadingData, setLoadingData] = useState(false);

  // --- MODALES ---
  const [modalReservaOpen, setModalReservaOpen] = useState(false);
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [modalCancelOpen, setModalCancelOpen] = useState(false); 
  const [modalConflictoOpen, setModalConflictoOpen] = useState(false); 
  
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [citaACancelarId, setCitaACancelarId] = useState(null); 
  const [mensajeConflicto, setMensajeConflicto] = useState(""); 
  
  const [reserving, setReserving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const horasDia = Array.from({ length: 13 }, (_, i) => {
    const h = i + 8; 
    return `${h.toString().padStart(2, '0')}:00`;
  });

  // =========================================================
  // 1. CARGA DE DATOS (FUSIÓN FISIOS + VALORACIONES)
  // =========================================================
  useEffect(() => {
    const cargarDatosFusionados = async () => {
      try {
        // Lanzamos las dos peticiones en paralelo para mayor velocidad
        const [resFisios, resValoraciones] = await Promise.all([
          api.get("/api/fisioterapeutas", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/api/valoraciones/todas") // Endpoint público o protegido según tu backend
        ]);

        const listaBaseFisios = Array.isArray(resFisios.data) ? resFisios.data : [];
        const listaValoraciones = resValoraciones.data.fisios || []; // Estructura basada en ReseñasDashboard

        // --- MERGE (FUSIÓN) ---
        const fisiosCompletos = listaBaseFisios.map((f) => {
          // Buscamos si este fisio tiene datos en el array de valoraciones
          // En ReseñasDashboard, 'grupo.fisio._id' es la clave
          const datosExtra = listaValoraciones.find(v => v.fisio._id === f._id);

          return {
            ...f,
            // Si encontramos datos, usamos la media. Si no, 0.
            rating: datosExtra ? Number(datosExtra.media) : 0,
            totalValoraciones: datosExtra ? datosExtra.reseñas.length : 0
          };
        });
        
        setFisios(fisiosCompletos);
        setFisiosFiltrados(fisiosCompletos); // Inicializamos filtrados

      } catch (err) {
        console.error("Error cargando datos fusionados:", err);
        // Fallback: Si falla la fusión, intentamos cargar solo los fisios sin rating
        try {
            const resFallback = await api.get("/api/users?rol=fisioterapeuta", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const dataFallback = Array.isArray(resFallback.data) ? resFallback.data : [];
            setFisios(dataFallback);
            setFisiosFiltrados(dataFallback);
        } catch(e) {}
      }
    };

    cargarDatosFusionados();
  }, [token]);

  // =========================================================
  // 2. LÓGICA DE FILTRADO EN TIEMPO REAL
  // =========================================================
  useEffect(() => {
    let resultado = fisios;

    // Filtro Texto (Nombre o Apellido)
    if (filtros.texto) {
      const lower = filtros.texto.toLowerCase();
      resultado = resultado.filter(f => 
        `${f.nombre} ${f.apellido}`.toLowerCase().includes(lower)
      );
    }

    // Filtro Especialidad
    if (filtros.especialidad) {
      resultado = resultado.filter(f => 
         f.especialidad === filtros.especialidad
      );
    }

    // Filtro Rating
    if (filtros.minRating > 0) {
      resultado = resultado.filter(f => 
         (f.rating || 0) >= filtros.minRating
      );
    }

    setFisiosFiltrados(resultado);
  }, [filtros, fisios]);
  
  // Persistencia de selección
  useEffect(() => {
      if(fisioId) localStorage.setItem('lastFisioId', fisioId);
  }, [fisioId]);


  // =========================================================
  // 3. CARGA DE CALENDARIO (SIN CAMBIOS)
  // =========================================================
  useEffect(() => {
    if (!fisioId) return;
    recargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fisioId, lunesSemana, token]);

  const recargarDatos = async () => {
    setLoadingData(true);
    try {
      const finSemana = new Date(lunesSemana);
      finSemana.setDate(finSemana.getDate() + 6);
      
      const resCitas = await api.get(`/api/citas?fisioterapeuta=${fisioId}`, {
         headers: { Authorization: `Bearer ${token}` }
      }); 
      
      const citasFiltradas = resCitas.data.filter(c => {
        const d = new Date(c.startAt);
        const idFisioCita = (c.fisioterapeuta?._id || c.fisioterapeuta || '').toString();
        const esDelFisioActual = idFisioCita === fisioId; 
        
        return esDelFisioActual && d >= lunesSemana && d <= finSemana && c.estado !== 'cancelada';
      });

      const resHorario = await api.get(`/api/disponibilidad/semana/${fisioId}`, {
         headers: { Authorization: `Bearer ${token}` }
      });

      const diasSemana = Array.from({ length: 5 }, (_, i) => {
          const d = new Date(lunesSemana);
          d.setDate(d.getDate() + i);
          return d.toISOString().split('T')[0];
      });

      const promesasIntervalos = diasSemana.map(async (fechaStr) => {
          try {
              const res = await api.get("/api/disponibilidad/intervalos", {
                  params: { fisioId, fecha: fechaStr, duracion: 60 },
                  headers: { Authorization: `Bearer ${token}` }
              });
              return { fecha: fechaStr, slots: res.data.intervalosLibres || [] };
          } catch (e) {
              return { fecha: fechaStr, slots: [] };
          }
      });

      const resultadosIntervalos = await Promise.all(promesasIntervalos);
      const mapaIntervalos = {};
      resultadosIntervalos.forEach(r => {
          mapaIntervalos[r.fecha] = r.slots.map(s => s.inicio);
      });
      
      setDatosSemana({
        misCitas: citasFiltradas, 
        horarioBase: resHorario.data.dias || [],
        intervalosLibresMap: mapaIntervalos
      });

    } catch (err) {
      console.error("Error cargando datos semana:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // --- HELPERS ---
  function getLunesActual() {
    const d = new Date();
    const dia = d.getDay();
    const diff = d.getDate() - dia + (dia === 0 ? -6 : 1);
    d.setHours(0,0,0,0);
    d.setDate(diff);
    return d;
  }

  function cambiarSemana(dir) {
    const nueva = new Date(lunesSemana);
    nueva.setDate(nueva.getDate() + (dir * 7));
    const lunesActual = getLunesActual();
    if (nueva < lunesActual) return;
    setLunesSemana(nueva);
  }

  function esPasado(fecha, horaStr) {
    const ahora = new Date();
    const [h, m] = horaStr.split(':');
    const fechaSlot = new Date(fecha);
    fechaSlot.setHours(parseInt(h), parseInt(m));
    return fechaSlot < ahora;
  }

  function esSemanaFutura() {
    return lunesSemana > getLunesActual();
  }

  // LÓGICA MAESTRA DE ESTADO DEL SLOT
  function getEstadoSlot(diaObj, horaStr) {
    const fechaStr = diaObj.toISOString().split('T')[0];

    const nombreDia = diaObj.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (esPasado(diaObj, horaStr)) return { estado: 'pasado' };

    const diaConfig = datosSemana.horarioBase.find(d => d.nombre === nombreDia);
    if (!diaConfig || !diaConfig.horas || diaConfig.horas.length === 0) return { estado: 'cerrado' }; 
    
    const minutosSlot = parseInt(horaStr.split(':')[0]) * 60 + parseInt(horaStr.split(':')[1]);
    const trabaja = diaConfig.horas.some(intervalo => {
      const [hIni, mIni] = intervalo.inicio.split(':').map(Number);
      const [hFin, mFin] = intervalo.fin.split(':').map(Number);
      const inicioMin = hIni * 60 + mIni;
      const finMin = hFin * 60 + mFin;
      return minutosSlot >= inicioMin && (minutosSlot + 60) <= finMin;
    });

    if (!trabaja) return { estado: 'cerrado' };

    const miCita = datosSemana.misCitas.find(c => {
      const inicioCita = new Date(c.startAt);
      return inicioCita.getDate() === diaObj.getDate() && 
             inicioCita.getMonth() === diaObj.getMonth() &&
             inicioCita.getHours() === parseInt(horaStr.split(':')[0]);
    });

    if (miCita) return { estado: 'mio', cita: miCita };

    const libresHoy = datosSemana.intervalosLibresMap[fechaStr] || [];
    if (libresHoy.includes(horaStr)) {
        return { estado: 'libre' };
    }

    return { estado: 'ocupado' };
  }

  const handleCellClick = (diaObj, horaStr, status) => {
    if (status.estado === 'libre') {
      const fisio = fisios.find(f => f._id === fisioId);
      const fechaSlot = new Date(diaObj);
      const [h, m] = horaStr.split(':');
      fechaSlot.setHours(parseInt(h), parseInt(m));

      setSlotSeleccionado({
        startAt: fechaSlot,
        hora: horaStr,
        fechaLegible: fechaSlot.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long'}),
        fisioNombre: fisio ? `${fisio.nombre} ${fisio.apellido}` : "Fisioterapeuta"
      });
      setModalReservaOpen(true);
    } else if (status.estado === 'mio') {
      setCitaSeleccionada(status.cita);
      setModalInfoOpen(true);
    }
  };

  const handleConfirmarReserva = async (formData) => {
    if (!slotSeleccionado) return;
    setReserving(true);
    
    try {
      await api.post("/api/citas", {
        fisioterapeutaId: fisioId,
        startAt: slotSeleccionado.startAt,
        durationMinutes: 60,
        motivo: formData.motivo,
        observaciones: formData.observaciones
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setModalReservaOpen(false);
      recargarDatos(); 

    } catch (err) {
      setModalReservaOpen(false);
      const errorMsg = err.response?.data?.msg || "Error desconocido al intentar reservar la cita.";
      setMensajeConflicto(errorMsg);
      setModalConflictoOpen(true);
      recargarDatos();
    } finally {
      setReserving(false);
    }
  };

  const handleRequestCancel = (citaId) => {
    setCitaACancelarId(citaId);
    setModalCancelOpen(true);
  };

  const handleConfirmarCancelacion = async () => {
    if (!citaACancelarId) return;
    setCancelling(true);
    try {
        await api.put(`/api/citas/${citaACancelarId}/estado`, { estado: 'cancelada' }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setModalCancelOpen(false);
        setModalInfoOpen(false);
        recargarDatos(); 
    } catch (err) {
        alert("No se pudo cancelar la cita");
    } finally {
        setCancelling(false);
        setCitaACancelarId(null);
    }
  };

  const diasRender = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(lunesSemana);
    d.setDate(d.getDate() + i);
    return d;
  });

  const esSemanaActual = lunesSemana.getTime() === getLunesActual().getTime();
  const mesActualStr = lunesSemana.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // =========================================================
  // RENDERIZADO
  // =========================================================
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-teal-700 mb-2">Reservar Cita</h1>
        <p className="text-gray-600 text-sm">Encuentra a tu especialista ideal y reserva en segundos.</p>
      </div>

      {/* --- BUSCADOR --- */}
      <BuscadorFisios 
         fisios={fisiosFiltrados}
         fisioSeleccionadoId={fisioId}
         onSelectFisio={setFisioId}
         filtros={filtros}
         setFiltros={setFiltros}
      />

      {esSemanaFutura() && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r shadow-sm">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Aviso:</strong> Estás visualizando una semana futura. Ten en cuenta que la disponibilidad del profesional podría cambiar y tu cita podría ser reubicada.
              </p>
            </div>
          </div>
        </div>
      )}

      {fisioId ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-teal-50 border-b border-teal-100">

             <button onClick={() => cambiarSemana(-1)} disabled={esSemanaActual} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${esSemanaActual ? "text-gray-300 cursor-not-allowed" : "text-teal-700 bg-white hover:bg-teal-600 hover:text-white shadow-sm"}`}>
                ← Anterior
             </button>
             <h2 className="text-xl font-bold text-teal-900 capitalize">{mesActualStr}</h2>

             <button onClick={() => cambiarSemana(1)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-white rounded-full shadow-sm hover:bg-teal-600 hover:text-white transition-all">
                Siguiente →
             </button>
          </div>

          <div className="p-6 overflow-x-auto">
            {loadingData ? (
               <div className="py-20 text-center text-gray-500">Cargando agenda...</div>
            ) : (
              <div className="min-w-[800px]">
                 <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className="col-span-1"></div>
                    {diasRender.map((d, i) => (
                      <div key={i} className="text-center p-2 bg-teal-50/50 rounded-lg">
                        <p className="text-xs font-bold text-teal-600 uppercase">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</p>
                        <p className="text-lg font-bold text-gray-700">{d.getDate()}</p>
                      </div>
                    ))}
                 </div>

                 {horasDia.map((hora) => (
                   <div key={hora} className="grid grid-cols-6 gap-2 mb-2">
                      <div className="col-span-1 flex items-center justify-center text-xs font-semibold text-gray-400">{hora}</div>
                      {diasRender.map((diaObj, i) => {
                        const status = getEstadoSlot(diaObj, hora);
                        let cellClass = "border transition-all duration-200 rounded-md h-12 flex items-center justify-center text-xs font-medium ";
                        let contenido = "";

                        switch(status.estado) {
                          case 'libre':
                            cellClass += "bg-white border-teal-200 text-teal-700 hover:bg-teal-500 hover:text-white cursor-pointer hover:shadow-md";
                            contenido = "Libre";
                            break;
                          case 'ocupado':
                            cellClass += "bg-amber-50 border-amber-100 text-amber-400 cursor-default";
                            contenido = "Ocupado";
                            break;
                          case 'mio':
                            cellClass += "bg-indigo-100 border-indigo-200 text-indigo-700 cursor-pointer hover:bg-indigo-200 ring-2 ring-indigo-400 ring-inset";
                            contenido = "Tu Cita";
                            break;
                          case 'cerrado':
                            cellClass += "bg-gray-50 border-transparent text-gray-300 cursor-not-allowed";
                            contenido = "-";
                            break;
                          case 'pasado':
                            cellClass += "bg-gray-50 border-transparent text-gray-300 cursor-not-allowed";
                            contenido = "-";
                            break;
                          default:
                            break;
                        }

                        return (
                          <div key={i} onClick={() => handleCellClick(diaObj, hora, status)} className={cellClass}>
                            {contenido}
                          </div>
                        );
                      })}
                   </div>
                 ))}
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-teal-200 rounded"></div> Disponible</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></div> Ocupado</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-100 border border-indigo-200 ring-1 ring-indigo-400 rounded"></div> Tu cita</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-50 rounded"></div> No disponible / Pasado</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 opacity-60">
           <p className="text-gray-500 text-lg">Selecciona un fisioterapeuta para ver su agenda.</p>
        </div>
      )}

      {/* MODALES */}
      <ConfirmacionModal isOpen={modalReservaOpen} onClose={() => setModalReservaOpen(false)} onConfirm={handleConfirmarReserva} datos={slotSeleccionado || {}} loading={reserving} />
      
      <InfoCitaModal 
        isOpen={modalInfoOpen} 
        onClose={() => setModalInfoOpen(false)} 
        cita={citaSeleccionada} 
        onRequestCancel={handleRequestCancel} 
      />

      <CancelarModal 
        isOpen={modalCancelOpen} 
        onClose={() => setModalCancelOpen(false)} 
        onConfirm={handleConfirmarCancelacion} 
        loading={cancelling} 
      />
       
      <ConflictoModal
        isOpen={modalConflictoOpen}
        onClose={() => setModalConflictoOpen(false)}
        message={mensajeConflicto}
      />
    </div>
  );
}