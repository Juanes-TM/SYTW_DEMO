import { Link } from "react-router-dom";


export default function FisioDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel del Fisioterapeuta</h1>
      <p>Bienvenido al panel del fisioterapeuta. Aquí podrás gestionar tu disponibilidad y tus pacientes.</p>
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
