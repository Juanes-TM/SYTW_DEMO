import { useState } from "react";

export default function CitasCalendar({ modo }) {
  const [view] = useState("week");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-teal-700 mb-4">
        {modo === "paciente"
          ? "Reservar una cita"
          : "Gestionar mis citas y disponibilidad"}
      </h2>

      <div className="bg-white rounded-xl shadow-md p-10 text-center">
        <p className="text-gray-600 mb-4">
          Aquí se mostrará el calendario de{" "}
          <strong>{modo === "paciente" ? "reservas" : "disponibilidad"}</strong>.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          (Este componente se activará cuando el modelo de base de datos esté implementado)
        </p>

        <div className="border-2 border-dashed border-teal-300 rounded-lg h-96 flex items-center justify-center">
          <p className="text-teal-600 font-medium">
            Calendario {modo === "paciente" ? "de citas" : "de disponibilidad"} — Vista {view}
          </p>
        </div>
      </div>
    </div>
  );
}
