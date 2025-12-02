// client/src/pages/dashboard/fisio/disponibilidad/DisponibilidadPage.jsx
import { useEffect, useState } from "react";
import { useDisponibilidad } from "../../../../hooks/useDisponibilidad";
import EditarCitaModal from "./EditarCitaModal"; // Importamos el modal específico del fisio

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

  // --- ESTADOS PARA GESTIÓN DE CITAS (MODAL) ---
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
        nuevo[d] = dia?.horas ? dia.horas.map(h => ({...h})) : [];
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

  // Función placeholder por si integras un calendario de citas aquí
  const handleCitaUpdate = () => {
    console.log("Cita actualizada, aquí recargarías tu calendario de citas.");
    // Si tuvieras una función fetchCitas(), la llamarías aquí.
  };

  if (loading && !semana) return <div className="p-8">Cargando disponibilidad...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-teal-700 mb-2">Disponibilidad semanal</h2>
        <p className="text-gray-600 mb-4">Configura tus horas disponibles.</p>
        
        {errorGuardado && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {errorGuardado}
            </div>
        )}
        {mensajeExito && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {mensajeExito}
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DIAS.map((dia) => (
              <div key={dia} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{etiquetasDias[dia]}</h3>
                  <button onClick={() => handleAddInterval(dia)} className="text-sm px-2 py-1 rounded bg-teal-600 text-white hover:bg-teal-700">
                    Añadir
                  </button>
                </div>
                {horarios[dia] && horarios[dia].length > 0 ? (
                  <div className="space-y-2">
                    {horarios[dia].map((h, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <input type="time" value={h.inicio} onChange={(e) => handleChangeInterval(dia, index, "inicio", e.target.value)} className="border rounded px-2 py-1 w-24" />
                        <span>-</span>
                        <input type="time" value={h.fin} onChange={(e) => handleChangeInterval(dia, index, "fin", e.target.value)} className="border rounded px-2 py-1 w-24" />
                        <button onClick={() => handleRemoveInterval(dia, index)} className="ml-auto text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">Quitar</button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400">Sin intervalos.</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleGuardar}
              disabled={guardando || !hayCambios}
              className={`px-4 py-2 rounded-lg shadow-sm font-medium transition-all ${guardando || !hayCambios ? "bg-gray-300 text-gray-500" : "bg-teal-600 text-white hover:bg-teal-700"}`}
            >
              {guardando ? "Guardando..." : "Guardar disponibilidad"}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL PARA GESTIONAR CITAS (Integrado y listo) --- */}
      {/* Se mostrará cuando setModalAbierto(true) y haya una citaSeleccionada */}
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