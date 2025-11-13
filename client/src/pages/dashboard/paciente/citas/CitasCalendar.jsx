import { useEffect, useMemo, useState } from "react";
import api from "../../../../services/api";
import { useFisioterapeutas } from "../../../../hooks/useFisioterapeutas";
import CrearCitaModal from "./CrearCitaModal";

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0-6 (domingo-sábado)
  const diff = (day === 0 ? -6 : 1) - day; // llevar a lunes
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateISO(d) {
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatHour(hourInt) {
  return `${hourInt.toString().padStart(2, "0")}:00`;
}

export default function CitasCalendar({ modo }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  const { fisios, loading: loadingFisios } = useFisioterapeutas();
  const [selectedFisioId, setSelectedFisioId] = useState("");
  const [selectedFisioNombre, setSelectedFisioNombre] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);
  const [mensajeError, setMensajeError] = useState("");

  const hours = useMemo(() => {
    const list = [];
    for (let h = 8; h < 20; h++) {
      list.push(h); // 8:00 a 19:00 (última cita 19-20)
    }
    return list;
  }, []);

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const fetchCitas = async () => {
    try {
      setLoadingCitas(true);
      const res = await api.get("/api/citas");
      setCitas(res.data);
    } catch (err) {
      console.error("Error al cargar citas:", err);
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const avanzarSemana = (delta) => {
    const nueva = new Date(weekStart);
    nueva.setDate(weekStart.getDate() + delta * 7);
    setWeekStart(startOfWeek(nueva));
  };

  const citasEnCelda = (dayDate, hourInt) => {
    const startStr = formatDateISO(dayDate);
    return citas.filter((c) => {
      const start = new Date(c.startAt);
      const sameDay = formatDateISO(start) === startStr;
      const sameHour = start.getHours() === hourInt;
      return sameDay && sameHour;
    });
  };

  const handleClickCelda = (dayDate, hourInt) => {
    setMensajeError("");

    if (modo !== "paciente") return;

    if (!selectedFisioId) {
      setMensajeError("Selecciona primero un fisioterapeuta.");
      return;
    }

    const fecha = formatDateISO(dayDate);
    const hora = formatHour(hourInt);

    const citasSlot = citasEnCelda(dayDate, hourInt);
    if (citasSlot.length > 0) {
      // Ojo: aquí solo vemos tus citas, el backend igualmente impedirá solapamientos con otros pacientes
      setMensajeError("Ya tienes una cita en este horario.");
      return;
    }

    setSlotSeleccionado({ fecha, hora });
    setModalVisible(true);
  };

  const handleCitaCreada = (nuevaCita) => {
    setCitas((prev) => [...prev, nuevaCita]);
  };

  const handleChangeFisio = (e) => {
    const id = e.target.value;
    setSelectedFisioId(id);
    const f = fisios.find((f) => f._id === id);
    setSelectedFisioNombre(f ? `${f.nombre} ${f.apellido}` : "");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-teal-700">
            {modo === "paciente"
              ? "Reservar una cita"
              : "Calendario de citas"}
          </h2>
          <p className="text-gray-600 text-sm">
            Semana del {days.length > 0 && formatDateISO(days[0])} al{" "}
            {days.length > 0 && formatDateISO(days[6])}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => avanzarSemana(-1)}
            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            Semana anterior
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            Hoy
          </button>
          <button
            onClick={() => avanzarSemana(1)}
            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            Semana siguiente
          </button>
        </div>
      </div>

      {modo === "paciente" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fisioterapeuta
          </label>
          {loadingFisios ? (
            <p className="text-sm text-gray-500">Cargando fisioterapeutas...</p>
          ) : (
            <select
              value={selectedFisioId}
              onChange={handleChangeFisio}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">Selecciona un fisioterapeuta</option>
              {fisios.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.nombre} {f.apellido}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {mensajeError && (
        <div className="mb-4 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
          {mensajeError}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
          <div className="bg-gray-100 border-b border-gray-200" />
          {days.map((d, idx) => (
            <div
              key={idx}
              className="bg-gray-100 border-b border-gray-200 px-2 py-2 text-center text-xs font-semibold text-gray-700"
            >
              {d.toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </div>
          ))}

          {hours.map((h) => (
            <div key={h} className="contents">
              <div className="border-t border-gray-200 text-xs text-gray-500 px-2 py-1 text-right">
                {formatHour(h)}
              </div>
              {days.map((d, idx) => {
                const citasCelda = citasEnCelda(d, h);
                const ocupado = citasCelda.length > 0;
                return (
                  <div
                    key={idx}
                    className={`border-t border-l border-gray-200 h-16 relative cursor-pointer ${
                      ocupado ? "bg-teal-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleClickCelda(d, h)}
                  >
                    {loadingCitas && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                        Cargando...
                      </span>
                    )}

                    {!loadingCitas &&
                      citasCelda.map((c) => (
                        <div
                          key={c._id}
                          className={`absolute inset-1 rounded-lg text-[10px] px-2 py-1 overflow-hidden ${
                            c.estado === "cancelada"
                              ? "bg-gray-300 text-gray-700 line-through"
                              : c.estado === "confirmada"
                              ? "bg-teal-600 text-white"
                              : c.estado === "completada"
                              ? "bg-emerald-500 text-white"
                              : "bg-amber-400 text-white"
                          }`}
                        >
                          {c.motivo}
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {modo === "paciente" && slotSeleccionado && (
        <CrearCitaModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          fisioterapeutaId={selectedFisioId}
          fisioterapeutaNombre={selectedFisioNombre}
          fecha={slotSeleccionado.fecha}
          hora={slotSeleccionado.hora}
          onCreated={handleCitaCreada}
        />
      )}
    </div>
  );
}
