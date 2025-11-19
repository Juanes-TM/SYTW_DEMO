import { Link } from "react-router-dom";

export default function PacienteDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel del Paciente</h1>
      <p className="text-gray-700 mb-4">
        Desde aquí podrás ver tus citas, reservar nuevas y gestionar tu
        información.
      </p>

      <div className="space-y-2">
        <Link
          to="/dashboard/paciente/citas"
          className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
        >
          Ver mis citas
        </Link>

        <br />

        <Link
          to="/dashboard/paciente/reservar"
          className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-sm"
        >
          Reservar una cita
        </Link>
      </div>
    </div>
  );
}
