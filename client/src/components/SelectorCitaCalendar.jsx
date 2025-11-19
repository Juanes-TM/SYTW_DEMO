// client/src/components/SelectorCitaCalendar.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

// Helpers
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateISO(d) {
  return d.toISOString().split("T")[0];
}

function formatHour(hourInt) {
  return `${hourInt.toString().padStart(2, "0")}:00`;
}

export default function SelectorCitaCalendar({ fisioId, onSlotSelected }) {
  const [weekStart] = useState(() => startOfWeek(new Date()));
  const [loading, setLoading] = useState(false);

  const [semana, setSemana] = useState(null);
  const [citasOcupadas, setCitasOcupadas] = useState([]);

  const hours = useMemo(() => [...Array(12)].map((_, i) => 8 + i), []);
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // Cargar disponibilidad + citas del fisio
  useEffect(() => {
    if (!fisioId) return;

    const cargar = async () => {
      setLoading(true);
      try {
        // DISPONIBILIDAD
        const res = await api.get(`/disponibilidad/semana/${fisioId}`);
        const data = res.data || {};
        data.dias = Array.isArray(data.dias) ? data.dias : [];
        setSemana(data);

        // CITAS OCUPADAS
        const citas = await api.get("/citas", { params: { fisioId } });
        setCitasOcupadas(Array.isArray(citas.data) ? citas.data : []);
      } catch (e) {
        console.error("Error:", e);
        setSemana({ dias: [] });
        setCitasOcupadas([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [fisioId]);

  // Disponible
  const estaDisponible = (day, hour) => {
    if (!semana || !Array.isArray(semana.dias)) return false;

    const nombre = day.toLocaleDateString("es-ES", { weekday: "long" }).toLowerCase();
    const dia = semana.dias.find((d) => d.nombre === nombre);
    if (!dia || !Array.isArray(dia.horas)) return false;

    const hInicio = `${hour.toString().padStart(2, "0")}:00`;
    const hFin = `${(hour + 1).toString().padStart(2, "0")}:00`;

    return dia.horas.some((b) => hInicio >= b.inicio && hFin <= b.fin);
  };

  // Ocupada
  const celdaOcupada = (day, hour) => {
    const dateStr = formatDateISO(day);
    return citasOcupadas.some((c) => {
      const s = new Date(c.startAt);
      return formatDateISO(s) === dateStr && s.getHours() === hour;
    });
  };

  const handleClick = (day, hour) => {
    if (!estaDisponible(day, hour)) return;
    if (celdaOcupada(day, hour)) return;

    onSlotSelected({
      startAt: new Date(day.setHours(hour, 0, 0, 0)),
      fecha: formatDateISO(day),
      hora: formatHour(hour)
    });
  };

  const styles = {
    dayHeader:
      "px-3 py-3 text-center font-semibold text-gray-800 border-b border-gray-200 " +
      "bg-gradient-to-b from-white to-gray-100 shadow-sm rounded-t-md",

    dayToday:
      "bg-teal-50 text-teal-700 font-bold shadow-inner border-b border-teal-200",

    hourCell:
      "px-2 py-1 text-right border-r border-gray-100 text-[11px] font-medium text-gray-500",

    hourBadge:
      "inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-semibold",

    cellBase: "border border-gray-100 h-14 relative cursor-pointer transition",
    cellHover: "hover:bg-gray-100/60",
    cellAltBackground: "bg-gray-50/40",
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h3 className="text-xl font-semibold text-teal-700 mb-4">
        Horarios disponibles
      </h3>

      {loading && <p>Cargando...</p>}

      {!loading && semana && semana.dias.length === 0 && (
        <p className="text-gray-500 text-sm">No hay disponibilidad.</p>
      )}

      {semana && semana.dias.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
          <div />

          {days.map((d, idx) => {
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div
                key={idx}
                className={`${styles.dayHeader} ${isToday ? styles.dayToday : ""}`}
              >
                {d.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </div>
            );
          })}

          {hours.map((h) => (
            <div key={h} className="contents">
              <div className={styles.hourCell}>
                <span className={styles.hourBadge}>{formatHour(h)}</span>
              </div>

              {days.map((d, idx) => {
                const disponible = estaDisponible(d, h);
                const ocupado = celdaOcupada(d, h);

                return (
                  <div
                    key={idx}
                    onClick={() => handleClick(new Date(d), h)}
                    className={`
                      ${styles.cellBase}
                      ${styles.cellHover}
                      ${h % 2 === 0 ? styles.cellAltBackground : ""}
                      ${ocupado ? "bg-red-300 cursor-not-allowed" : ""}
                      ${!ocupado && disponible ? "bg-teal-100 hover:bg-teal-200" : ""}
                      ${!ocupado && !disponible ? "bg-gray-200 cursor-not-allowed" : ""}
                    `}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
