// client/src/pages/dashboard/fisio/disponibilidad/DisponibilidadPage.jsx
import { useEffect, useState } from "react";
import { useDisponibilidad } from "../../../../hooks/useDisponibilidad";
import EditarCitaModal from "../../../../pages/dashboard/paciente/citas/EditarCitaModal";
import { CalendarCheck, Plus, Trash2, Save, Loader2, AlertTriangle, CheckCircle } from "lucide-react";


const DIAS = [
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
];

const etiquetasDias = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
  jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo"
};

export default function DisponibilidadPage() {
  const fisioLS = JSON.parse(localStorage.getItem("fisioUser"));
  const fisioId = fisioLS?.user?._id;
  const rol = fisioLS?.user?.rol;

  const { semana, loading, guardarSemana } = useDisponibilidad(fisioId);

  const [horarios, setHorarios] = useState({});
  const [originalHash, setOriginalHash] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // --- ESTADOS PARA GESTIÓN DE CITAS ---
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Inicializar horarios
  useEffect(() => {
    const inicial = {};
    DIAS.forEach((d) => { inicial[d] = []; });
    setHorarios(inicial);
    setOriginalHash(JSON.stringify(inicial));
  }, []);

  // Cargar datos
  useEffect(() => {
    if (semana && semana.dias) {
      const nuevo = {};
      DIAS.forEach((d) => {
        const dia = semana.dias.find((x) => x.nombre === d);
        nuevo[d] = dia?.horas ? dia.horas.map(h => ({ ...h })) : [];
      });
      setHorarios(nuevo);
      setOriginalHash(JSON.stringify(nuevo));
    }
  }, [semana]);

  const hayCambios = JSON.stringify(horarios) !== originalHash;

  if (rol !== "fisioterapeuta") {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <p className="text-red-600">No autorizado.</p>
      </div>
    );
  }

  // --- MANEJADORES DE INTERVALOS ---
  const handleAddInterval = (dia) => {
    setHorarios((prev) => ({
      ...prev, [dia]: [...(prev[dia] || []), { inicio: "09:00", fin: "10:00" }]
    }));
    setErrorGuardado(null);
    setMensajeExito(null);
  };

  const handleChangeInterval = (dia, index, campo, valor) => {
    setHorarios((prev) => {
      const copia = { ...prev };
      const arr = [...copia[dia]];
      arr[index] = { ...arr[index], [campo]: valor };
      copia[dia] = arr;
      return copia;
    });
    setErrorGuardado(null);
    setMensajeExito(null);
  };

  const handleRemoveInterval = (dia, index) => {
    setHorarios((prev) => {
      const copia = { ...prev };
      copia[dia] = copia[dia].filter((_, i) => i !== index);
      return copia;
    });
    setErrorGuardado(null);
    setMensajeExito(null);
  };

  const handleGuardar = async () => {
    if (!hayCambios) return;
    setErrorGuardado(null);
    setMensajeExito(null);
    try {
      setGuardando(true);
      await guardarSemana(horarios);
      setOriginalHash(JSON.stringify(horarios));
      setMensajeExito("Disponibilidad guardada correctamente.");
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      setErrorGuardado(err.response?.data?.msg || "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCitaUpdate = () => {
    console.log("Cita actualizada, aquí recargarías tu calendario de citas.");
  };

  if (loading && !semana) return <div className="p-8">Cargando disponibilidad...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-4 border-b pb-4">
          <CalendarCheck className="text-teal-600 w-7 h-7" />
          <h2 className="text-3xl font-extrabold text-gray-800">
            Disponibilidad Semanal
          </h2>
        </div>
        <p className="text-gray-600 mb-6">
          Configura tus franjas horarias disponibles para que los pacientes puedan reservar citas.
        </p>

        {/* Mensajes de estado */}
        {errorGuardado && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 mb-4 shadow-md">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-semibold">Error:</p> <p>{errorGuardado}</p>
          </div>
        )}
        {mensajeExito && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 mb-4 shadow-md">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Éxito:</p> <p>{mensajeExito}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

          {/* Contenedor de días */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DIAS.map((dia) => (
              <div
                key={dia}
                className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition shadow-sm"
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800 uppercase tracking-wider">
                    {etiquetasDias[dia]}
                  </h3>
                  <button
                    onClick={() => handleAddInterval(dia)}
                    className="text-sm px-3 py-1 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir
                  </button>
                </div>
                {horarios[dia] && horarios[dia].length > 0 ? (
                  <div className="space-y-3">
                    {horarios[dia].map((h, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">

                        <input
                          type="time"
                          value={h.inicio}
                          onChange={(e) => handleChangeInterval(dia, index, "inicio", e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-28 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                        />
                        <span className="text-gray-500 font-bold">-</span>
                        <input
                          type="time"
                          value={h.fin}
                          onChange={(e) => handleChangeInterval(dia, index, "fin", e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-28 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                        />

                        <button
                          onClick={() => handleRemoveInterval(dia, index)}
                          className="ml-auto text-red-500 hover:text-red-700 p-2 rounded-full transition"
                          title="Quitar intervalo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500 italic mt-2">No hay franjas de disponibilidad para este día.</p>}
              </div>
            ))}
          </div>

          {/* Botón de Guardar */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleGuardar}
              disabled={guardando || !hayCambios}
              className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg font-semibold transition-all duration-200
                    ${guardando
                  ? "bg-teal-400 text-white cursor-wait"
                  : !hayCambios
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700 transform hover:scale-[1.01]"
                }
                `}
            >
              {guardando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar disponibilidad
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL PARA GESTIONAR CITAS --- */}
      {modalAbierto && citaSeleccionada && (
        <EditarCitaModal
          visible={true}
          cita={citaSeleccionada}
          onClose={() => setModalAbierto(false)}
          onUpdate={handleCitaUpdate}
        />
      )}
    </div>
  );
}