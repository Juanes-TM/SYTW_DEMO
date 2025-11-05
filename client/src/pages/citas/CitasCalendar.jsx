import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../../services/api";
import { useSelector } from "react-redux";

// 🔹 Configuración de localización
moment.locale("es");
moment.updateLocale("es", { week: { dow: 1 } });
const localizer = momentLocalizer(moment);

export default function CitasCalendar({ modo }) {
  const { user } = useSelector((state) => state.user);
  const [fisios, setFisios] = useState([]);
  const [fisioId, setFisioId] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTipo, setModalTipo] = useState("reserva"); // reserva | cancelar | disponibilidad

  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());

  // 🔹 Cargar fisioterapeutas (para pacientes)
  useEffect(() => {
    if (modo === "paciente") {
      api.get("/usuarios?rol=therapist").then((res) => setFisios(res.data));
    } else if (modo === "fisio") {
      api
        .get(`/usuarios?email=${user.user.toLowerCase()}`)
        .then((res) => {
          if (res.data.length > 0) setFisioId(res.data[0].id);
        })
        .catch((err) => console.error("Error al obtener el fisioId:", err));
    }
  }, [modo, user.user]);

  // 🔹 Cargar disponibilidades y citas
  useEffect(() => {
    if (!fisioId) return;

    Promise.all([
      api.get(`/disponibilidades?fisioId=${fisioId}`),
      api.get(`/citas?fisioId=${fisioId}`)
    ])
      .then(([dispsRes, citasRes]) => {
        const disponibilidades =
          modo === "paciente" || modo === "fisio"
            ? dispsRes.data.flatMap((disp) =>
                disp.horas.map((hora) => ({
                  title: "Disponible",
                  start: new Date(`${disp.fecha}T${hora}:00`),
                  end: new Date(`${disp.fecha}T${hora}:00`),
                  allDay: false,
                  tipo: "disponible",
                  fecha: disp.fecha,
                  hora
                }))
              )
            : [];

        const citas = citasRes.data.map((cita) => ({
          id: cita.id,
          title:
            modo === "fisio"
              ? `Cita con ${cita.paciente}`
              : `Cita con ${
                  fisios.find((f) => f.id === cita.fisioId)?.nombre || "Fisio"
                }`,
          start: new Date(`${cita.fecha}T${cita.hora}:00`),
          end: new Date(`${cita.fecha}T${cita.hora}:00`),
          allDay: false,
          tipo: "reservado",
          fecha: cita.fecha,
          hora: cita.hora
        }));

        setEvents([...disponibilidades, ...citas]);
      })
      .catch((err) => console.error("Error al cargar citas/disponibilidades:", err));
  }, [fisioId, modo, fisios]);

  // 🔹 Click en evento existente
  const handleSelectEvent = (event) => {
    if (modo === "paciente" && event.tipo === "disponible") {
      setSelectedEvent(event);
      setModalTipo("reserva");
      setShowModal(true);
    } else if (modo === "fisio" && event.tipo === "reservado") {
      setSelectedEvent(event);
      setModalTipo("cancelar");
      setShowModal(true);
    } else {
      alert("⛔ Acción no permitida sobre este evento.");
    }
  };

  // 🔹 Click en hueco vacío del calendario (solo fisio)
  const handleSelectSlot = (slotInfo) => {
    if (modo === "fisio") {
      const fecha = slotInfo.start.toISOString().split("T")[0];
      const hora = slotInfo.start.toTimeString().slice(0, 5);

      setSelectedEvent({ fecha, hora });
      setModalTipo("disponibilidad");
      setShowModal(true);
    }
  };

  // 🔹 Crear nueva disponibilidad
  const confirmarDisponibilidad = async () => {
    if (!selectedEvent || !fisioId) return;

    const { fecha, hora } = selectedEvent;

    try {
      const { data: disponibilidades } = await api.get(`/disponibilidades?fisioId=${fisioId}`);
      let disponibilidadDia = disponibilidades.find((d) => d.fecha === fecha);

      if (disponibilidadDia) {
        if (!disponibilidadDia.horas.includes(hora)) {
          const nuevasHoras = [...disponibilidadDia.horas, hora].sort();
          await api.put(`/disponibilidades/${disponibilidadDia.id}`, {
            ...disponibilidadDia,
            horas: nuevasHoras
          });
        }
      } else {
        await api.post("/disponibilidades", {
          fisioId: parseInt(fisioId),
          fecha,
          horas: [hora]
        });
      }

      setEvents((prev) => [
        ...prev,
        {
          title: "Disponible",
          start: new Date(`${fecha}T${hora}:00`),
          end: new Date(`${fecha}T${hora}:00`),
          tipo: "disponible"
        }
      ]);

      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error al crear disponibilidad:", error);
    }
  };

  // 🔹 Confirmar reserva (paciente)
  const confirmarReserva = async () => {
    if (!selectedEvent || !fisioId) return;

    const fecha = selectedEvent.start.toISOString().split("T")[0];
    const hora = selectedEvent.start.toTimeString().slice(0, 5);

    try {
      await api.post("/citas", {
        paciente: user.user,
        fisioId: parseInt(fisioId),
        fecha,
        hora
      });

      const { data: disponibilidades } = await api.get(`/disponibilidades?fisioId=${fisioId}`);
      const disponibilidadDia = disponibilidades.find((d) => d.fecha === fecha);
      if (disponibilidadDia) {
        const nuevasHoras = disponibilidadDia.horas.filter((h) => h !== hora);
        await api.put(`/disponibilidades/${disponibilidadDia.id}`, {
          ...disponibilidadDia,
          horas: nuevasHoras
        });
      }

      setEvents((prev) =>
        prev.map((ev) =>
          ev.start.getTime() === selectedEvent.start.getTime() &&
          ev.tipo === "disponible"
            ? { ...ev, title: `Cita con ${user.user}`, tipo: "reservado" }
            : ev
        )
      );

      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error al confirmar la reserva:", error);
    }
  };

  // 🔹 Cancelar cita (fisioterapeuta)
  const cancelarCita = async () => {
    if (!selectedEvent || !selectedEvent.id) return;

    try {
      await api.delete(`/citas/${selectedEvent.id}`);

      const { data: disponibilidades } = await api.get(`/disponibilidades?fisioId=${fisioId}`);
      let disponibilidadDia = disponibilidades.find((d) => d.fecha === selectedEvent.fecha);

      if (disponibilidadDia) {
        const nuevasHoras = [...disponibilidadDia.horas, selectedEvent.hora].sort();
        await api.put(`/disponibilidades/${disponibilidadDia.id}`, {
          ...disponibilidadDia,
          horas: nuevasHoras
        });
      } else {
        await api.post("/disponibilidades", {
          fisioId: parseInt(fisioId),
          fecha: selectedEvent.fecha,
          horas: [selectedEvent.hora]
        });
      }

      setEvents((prev) => prev.filter((ev) => ev.id !== selectedEvent.id));

      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error al cancelar la cita:", error);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const eventPropGetter = (event) => {
    let backgroundColor = "#4ade80"; // Verde disponible
    if (event.tipo === "reservado") backgroundColor = "#f87171"; // Rojo reservado
    return {
      style: {
        backgroundColor,
        color: "#fff",
        borderRadius: "8px",
        fontWeight: "500"
      }
    };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-semibold text-teal-700 mb-4">
        {modo === "paciente"
          ? "Reservar una cita"
          : "Gestionar mis citas y disponibilidad"}
      </h2>

      {modo === "paciente" && (
        <div className="mb-4">
          <select
            onChange={(e) => setFisioId(e.target.value)}
            className="border p-2 rounded-md text-gray-700"
          >
            <option value="">Seleccionar fisioterapeuta...</option>
            {fisios.map((fisio) => (
              <option key={fisio.id} value={fisio.id}>
                {fisio.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-md">
        <Calendar
          localizer={localizer}
          culture="es"
          events={events}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          selectable={modo === "fisio"}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventPropGetter}
          style={{ height: 600 }}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-96 text-center">
            {modalTipo === "reserva" && (
              <>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">
                  Confirmar reserva
                </h3>
                <p className="text-gray-600 mb-4">
                  ¿Deseas reservar esta cita con{" "}
                  <strong>
                    {
                      fisios.find((f) => f.id === parseInt(fisioId))?.nombre ??
                      "el fisioterapeuta"
                    }
                  </strong>{" "}
                  el{" "}
                  <strong>
                    {selectedEvent.start.toLocaleDateString()} a las{" "}
                    {selectedEvent.start.toTimeString().slice(0, 5)}
                  </strong>
                  ?
                </p>
                <div className="flex justify-around mt-6">
                  <button
                    onClick={cerrarModal}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarReserva}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}

            {modalTipo === "cancelar" && (
              <>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Cancelar cita
                </h3>
                <p className="text-gray-600 mb-4">
                  ¿Deseas cancelar la cita del{" "}
                  <strong>
                    {selectedEvent.fecha} a las {selectedEvent.hora}
                  </strong>
                  ?
                </p>
                <div className="flex justify-around mt-6">
                  <button
                    onClick={cerrarModal}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                  >
                    Mantener
                  </button>
                  <button
                    onClick={cancelarCita}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Cancelar cita
                  </button>
                </div>
              </>
            )}

            {modalTipo === "disponibilidad" && (
              <>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">
                  Añadir disponibilidad
                </h3>
                <p className="text-gray-600 mb-4">
                  ¿Deseas añadir una hora disponible el{" "}
                  <strong>
                    {selectedEvent.fecha} a las {selectedEvent.hora}
                  </strong>
                  ?
                </p>
                <div className="flex justify-around mt-6">
                  <button
                    onClick={cerrarModal}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarDisponibilidad}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                  >
                    Añadir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
