import { Link } from "react-router-dom";


export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel del Administrador</h1>
      <p>Bienvenido al panel del administrador. Desde aquí podrás gestionar usuarios y supervisar el sistema.</p>
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
