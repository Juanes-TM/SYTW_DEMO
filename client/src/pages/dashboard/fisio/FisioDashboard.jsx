//client/src/pages/dashboard/fisio/FisioDashboard.jsx
import { useState } from "react";
import { useCitas } from "../../../hooks/useCitas"; // Asegúrate de que la ruta sea correcta
import { Calendar, Clock, Users, Pencil, AlertCircle } from "lucide-react";

// ======================
// 1. MODAL DE CANCELACIÓN
// ======================
function CancelarModal({ isOpen, onClose, onConfirm, loading }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!motivo.trim()) {
      setError("Debes indicar un motivo para la cancelación.");
      return;
    }
    onConfirm(motivo);
    setMotivo(""); 
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Cabecera */}
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full text-red-600">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-red-700">Cancelar Cita</h3>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            Estás a punto de cancelar esta cita. Esta acción notificará al paciente. 
            Por favor, indica el motivo:
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de la cancelación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError("");
              }}
              placeholder="Ej: Indisposición personal, error en la reserva..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-sm"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={loading}
          >
            Volver
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            {loading ? "Procesando..." : "Confirmar Cancelación"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================
// 2. COMPONENTE TARJETA CITA
// ======================
const TarjetaCita = ({ cita, formatHora, mostrarFecha, onCancel }) => {
  const [expandido, setExpandido] = useState(false);

  const estadoClases = {
    pendiente: "bg-yellow-100 text-yellow-800",
    confirmada: "bg-blue-100 text-blue-800",
    cancelada: "bg-red-100 text-red-800",
    completada: "bg-green-100 text-green-800",
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    
  // Fecha corta para cabecera (Ej: "Lun, 12 Oct")
  const fechaCabecera = new Date(cita.startAt).toLocaleDateString("es-ES", { 
      weekday: 'short', day: 'numeric', month: 'short' 
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-200 transition hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          {/* Mostrar fecha solo si se pide (cuando no es filtro "hoy") */}
          {mostrarFecha && (
            <p className="text-xs font-bold text-teal-600 mb-0.5 uppercase tracking-wide">
              {fechaCabecera}
            </p>
          )}
          
          <p className="text-lg font-semibold text-gray-800">
            {formatHora(cita.startAt)} – {formatHora(cita.endAt)}
          </p>
          <p className="text-gray-600 mt-1">
            Paciente:
            <span className="font-bold">
              {" "}
              {cita.paciente?.nombre} {cita.paciente?.apellido}
            </span>
          </p>
          <p className="text-teal-600 text-sm mt-1">Motivo: {cita.motivo}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              estadoClases[cita.estado] || "bg-gray-200 text-gray-700"
            }`}
          >
            {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
          </span>

          <button
            onClick={() => setExpandido(!expandido)}
            className="text-sm text-teal-500 hover:text-teal-700 font-medium"
          >
            {expandido ? "Ver menos" : "Ver más"}
          </button>
        </div>
      </div>

      {expandido && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-sm space-y-1">
          <p>
            <strong>Fecha completa:</strong> {formatDate(cita.startAt)}
          </p>
          <p>
            <strong>Email paciente:</strong> {cita.paciente?.email}
          </p>
          {cita.observaciones && (
            <p className="mt-1 p-2 bg-gray-50 border-l-4 border-gray-300 rounded">
              <strong>Notas:</strong> {cita.observaciones}
            </p>
          )}

          {/* Botón de Cancelar (Solo si es pendiente/confirmada y existe la función onCancel) */}
          {onCancel && (cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onCancel(cita)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded border border-red-200 text-xs font-semibold transition flex items-center gap-1"
              >
                <AlertCircle size={14} />
                Cancelar Cita
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ========================
// 3. COMPONENTE PRÓXIMA CITA
// ========================
function ProximaCitaBanner({ citas }) {
  const ahora = new Date();

  const citasFuturas = citas.filter((c) => {
    const fechaCita = new Date(c.startAt);
    return (
      fechaCita > ahora &&
      (c.estado === "pendiente" || c.estado === "confirmada")
    );
  });

  citasFuturas.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  const proxima = citasFuturas[0];

  return (
    <div className="p-6 rounded-2xl shadow-md bg-gradient-to-br from-teal-600 to-teal-700 text-white relative overflow-hidden">
      <div className="absolute right-6 top-6 opacity-20 pointer-events-none z-0">
        <Clock size={90} />
      </div>

      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock size={22} className="opacity-90" />
        Próxima cita
      </h3>

      {!proxima ? (
        <p className="text-teal-100 italic">
          No tienes próximas citas pendientes.
        </p>
      ) : (
        <div className="flex flex-row justify-between items-start gap-6 z-10 relative">
          <div className="flex-1">
            <p className="text-4xl font-bold tracking-wide">
              {new Date(proxima.startAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-teal-200 mt-1 font-medium uppercase tracking-wide">
              {new Date(proxima.startAt).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="mt-4 text-teal-100 text-sm">
              Paciente:
              <span className="font-semibold text-white ml-1 block text-lg">
                {proxima.paciente?.nombre} {proxima.paciente?.apellido}
              </span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl text-sm flex-1 max-w-[60%]" style={{ marginRight: "10px" }}>
            <p className="font-bold text-white text-lg mb-1">
              Motivo:
              <span className="text-teal-50 font-medium ml-1 text-base block">
                {proxima.motivo}
              </span>
            </p>
            {proxima.observaciones && (
              <div className="mt-2">
                <p className="font-semibold text-white text-xs uppercase tracking-wider opacity-80">
                  Observaciones:
                </p>
                <p className="text-teal-50 text-xs italic mt-1 line-clamp-2">
                  {proxima.observaciones}
                </p>
              </div>
            )}
            <span className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-semibold ${proxima.estado === "confirmada" ? "bg-blue-500" : "bg-yellow-500"} text-white shadow-sm`}>
              {proxima.estado.charAt(0).toUpperCase() + proxima.estado.slice(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================
// 4. COMPONENTE NOTAS RÁPIDAS
// ========================
function NotasRapidas() {
  const [texto, setTexto] = useState(localStorage.getItem("notasFisio") || "");

  const guardar = (value) => {
    setTexto(value);
    localStorage.setItem("notasFisio", value);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Pencil size={22} className="opacity-90" />
        Notas rápidas
      </h3>
      <textarea
        value={texto}
        onChange={(e) => guardar(e.target.value)}
        placeholder="Escribe recordatorios..."
        className="w-full h-28 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none text-gray-700 resize-none shadow-sm"
      />
      <p className="text-xs text-gray-400 mt-1">Guardado automático</p>
    </div>
  );
}

// ======================
// 5. COMPONENTE TARJETA RESUMEN
// ======================
function ResumenCard({ title, value, icon }) {
  return (
    <div className="bg-white p-4 shadow rounded-xl border flex items-center gap-4">
      <div className="p-3 bg-teal-100 rounded-lg text-teal-700">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// ======================
// 6. COMPONENTE PRINCIPAL (DASHBOARD)
// ======================
export default function FisioDashboard() {
  const { citas, loading } = useCitas();

  // --- ESTADOS DE FILTRO ---
  const [filtroProgramadas, setFiltroProgramadas] = useState("hoy");
  const [filtroCanceladas, setFiltroCanceladas] = useState("semana");
  
  // --- ESTADOS HISTORIAL ---
  const [hEstado, setHEstado] = useState("todos"); 
  const [hMes, setHMes] = useState("todos"); 
  const [hAnio, setHAnio] = useState("todos");

  // --- ESTADOS DE CANCELACIÓN ---
  const [modalOpen, setModalOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  if (loading) return <p className="p-6">Cargando panel...</p>;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // --- LOGICA DE CANCELACIÓN ---
  const abrirModalCancelacion = (cita) => {
    setCitaSeleccionada(cita);
    setModalOpen(true);
  };

  const confirmarCancelacion = async (motivo) => {
    if (!citaSeleccionada) return;
    setCancelLoading(true);

    try {
        const token = localStorage.getItem("token");
        // NOTA: Ajusta la URL si tu backend corre en otro puerto
        const response = await fetch(`http://localhost:5000/api/citas/${citaSeleccionada._id}/cancelar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                motivo: motivo,
                canceladoPor: 'fisio' 
            })
        });

        if (!response.ok) throw new Error('Error al cancelar la cita');

        // Recargar para ver cambios (o usar refetch si lo tienes)
        window.location.reload(); 
        
    } catch (error) {
        console.error(error);
        alert("Hubo un error al cancelar la cita.");
    } finally {
        setCancelLoading(false);
        setModalOpen(false);
        setCitaSeleccionada(null);
    }
  };

  // --- HELPERS FILTROS ---
  const formatHora = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const aplicarFiltroTiempo = (lista, tipoFiltro) => {
    if (tipoFiltro === "hoy") {
      return lista.filter((c) => {
        const f = new Date(c.startAt);
        f.setHours(0, 0, 0, 0);
        return f.getTime() === hoy.getTime();
      });
    } else if (tipoFiltro === "semana") {
      return lista.filter((c) => {
        const f = new Date(c.startAt);
        return f - hoy <= 7 * 24 * 60 * 60 * 1000 && f >= hoy;
      });
    }
    return lista; // "todas"
  };

  // --- PROCESAMIENTO LISTAS ---
  const citasProgramadasRaw = citas.filter(
    (c) => c.estado === "pendiente" || c.estado === "confirmada"
  );
  const citasCanceladasRaw = citas.filter((c) => c.estado === "cancelada");

  const citasProgramadasVisibles = aplicarFiltroTiempo(citasProgramadasRaw, filtroProgramadas);
  const citasCanceladasVisibles = aplicarFiltroTiempo(citasCanceladasRaw, filtroCanceladas);

  citasProgramadasVisibles.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  citasCanceladasVisibles.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

  // --- PROCESAMIENTO HISTORIAL ---
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const currentYear = new Date().getFullYear();
  const anios = [currentYear - 1, currentYear, currentYear + 1];

  const historialFiltrado = citas.filter((c) => {
    const fecha = new Date(c.startAt);
    const cMes = fecha.getMonth();
    const cAnio = fecha.getFullYear();

    if (hAnio !== "todos" && cAnio !== parseInt(hAnio)) return false;
    if (hMes !== "todos" && cMes !== parseInt(hMes)) return false;

    if (hEstado !== "todos") {
      return c.estado === hEstado;
    } else {
      // Por defecto muestra todo el historial (pasado)
      return ["completada", "cancelada", "pendiente", "confirmada"].includes(c.estado);
    }
  }).sort((a, b) => new Date(b.startAt) - new Date(a.startAt));


  // --- DATOS RESUMEN ---
  const citasHoyTotal = citas.filter((c) => {
    const f = new Date(c.startAt);
    f.setHours(0, 0, 0, 0);
    return f.getTime() === hoy.getTime();
  });

  const proximaDeHoy = citasHoyTotal.find((c) => new Date(c.startAt) > new Date());
  const proximaCitaTexto = proximaDeHoy
    ? `${formatHora(proximaDeHoy.startAt)} – ${proximaDeHoy.paciente?.nombre}`
    : "No hay más hoy";

  const canceladasHoy = citasHoyTotal.filter((c) => c.estado === "cancelada").length;
  
  const citasSemanaTotal = citas.filter((c) => {
    const f = new Date(c.startAt);
    return f - hoy <= 7 * 24 * 60 * 60 * 1000 && f >= hoy;
  }).length;


  // --- RENDERIZADO ---
  return (
    <div className="p-6 space-y-10">
      
      {/* Modal de Cancelación */}
      <CancelarModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={confirmarCancelacion}
        loading={cancelLoading}
      />

      {/* 1. Próxima cita + Notas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProximaCitaBanner citas={citas} />
        <NotasRapidas />
      </div>

      {/* 2. Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ResumenCard title="Citas Hoy" value={citasHoyTotal.length} icon={<Calendar size={28} />} />
        <ResumenCard title="Canceladas Hoy" value={canceladasHoy} icon={<Clock size={28} />} />
        <ResumenCard title="Citas Semana" value={citasSemanaTotal} icon={<Calendar size={28} />} />
        <ResumenCard title="Siguiente (Hoy)" value={proximaCitaTexto} icon={<Users size={28} />} />
      </div>

      {/* 3. Sección Citas Programadas */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-700">Citas Programadas</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Mostrando {citasProgramadasVisibles.length} citas
          </span>
        </div>
        <div className="flex gap-2 mb-5">
          {["hoy", "semana", "todas"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroProgramadas(f)}
              className={`px-4 py-1 rounded-md font-medium ${
                filtroProgramadas === f
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {f === "hoy" && "Hoy"}
              {f === "semana" && "Esta semana"}
              {f === "todas" && "Todas"}
            </button>
          ))}
        </div>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 border-t border-gray-100 pt-4 custom-scrollbar">
          {citasProgramadasVisibles.length === 0 ? (
            <p className="text-gray-500 italic">No hay citas pendientes para este periodo.</p>
          ) : (
            citasProgramadasVisibles.map((c) => (
              <TarjetaCita 
                key={c._id} 
                cita={c} 
                formatHora={formatHora} 
                mostrarFecha={filtroProgramadas !== "hoy"}
                onCancel={abrirModalCancelacion}
              />
            ))
          )}
        </div>
      </section>

      {/* 4. Sección Citas Canceladas */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-700">Citas Canceladas</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Mostrando {citasCanceladasVisibles.length} citas
          </span>
        </div>
        <div className="flex gap-2 mb-5">
          {["hoy", "semana", "todas"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroCanceladas(f)}
              className={`px-4 py-1 rounded-md font-medium ${
                filtroCanceladas === f
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {f === "hoy" && "Hoy"}
              {f === "semana" && "Esta semana"}
              {f === "todas" && "Todas"}
            </button>
          ))}
        </div>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 border-t border-gray-100 pt-4 custom-scrollbar">
          {citasCanceladasVisibles.length === 0 ? (
            <p className="text-gray-500 italic">No hay citas canceladas para este periodo.</p>
          ) : (
            citasCanceladasVisibles.map((c) => (
              <TarjetaCita 
                key={c._id} 
                cita={c} 
                formatHora={formatHora} 
                mostrarFecha={filtroCanceladas !== "hoy"}
                // No pasamos onCancel aquí porque ya están canceladas
              />
            ))
          )}
        </div>
      </section>

      {/* 5. Sección Historial Avanzado */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-700">Historial de Citas</h2>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={hEstado}
              onChange={(e) => setHEstado(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none shadow-sm"
            >
              <option value="todos">Estado: Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>

            <select
              value={hMes}
              onChange={(e) => setHMes(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none shadow-sm"
            >
              <option value="todos">Todos los meses</option>
              {meses.map((mes, index) => (
                <option key={index} value={index}>{mes}</option>
              ))}
            </select>

            <select
              value={hAnio}
              onChange={(e) => setHAnio(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none shadow-sm"
            >
              <option value="todos">Todos los años</option>
              {anios.map((anio) => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
          <div className="max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
            <div className="relative pl-8 border-l-2 border-gray-300 space-y-6">
              {historialFiltrado.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 italic mb-1">No se encontraron citas con estos filtros.</p>
                  <button 
                    onClick={() => {setHEstado('todos'); setHMes('todos'); setHAnio('todos')}}
                    className="text-teal-600 text-sm font-medium hover:underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                historialFiltrado.map((cita) => {
                  const fecha = new Date(cita.startAt).toLocaleDateString("es-ES", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                  });
                  const estado = cita.estado;
                  const colores = {
                    pendiente: "bg-yellow-400",
                    confirmada: "bg-blue-500",
                    completada: "bg-green-500",
                    cancelada: "bg-red-500",
                  };

                  return (
                    <div key={cita._id} className="relative">
                      <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full border-4 border-white shadow ${colores[estado] || "bg-gray-400"}`} />
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-gray-800">{fecha}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${colores[estado] || "bg-gray-400"}`}>
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                          </span>
                        </div>
                        <p className="font-medium text-gray-700">
                          Paciente: {cita.paciente?.nombre} {cita.paciente?.apellido}
                        </p>
                        <p className="text-sm text-gray-600">Motivo: {cita.motivo}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}