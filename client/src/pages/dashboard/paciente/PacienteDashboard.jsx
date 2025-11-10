import { Link } from "react-router-dom";


export default function PacienteDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel del Paciente</h1>
      <p>Bienvenido al panel del paciente. Desde aquí podrás ver tus citas y gestionar tu información.</p>
      <br />
      <Link 
        to="/profile"
        className="text-teal-700 font-semibold underline hover:text-teal-900"
      >
        Ver mi perfil
      </Link>
    </div>
  );
}
