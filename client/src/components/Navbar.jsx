import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";

function Navbar() {
  const { role, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => dispatch(logout());

  return (
    <nav className="bg-teal-700 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="font-bold text-xl tracking-wide">
        FisioTrack <span className="text-sm font-light ml-2">({user})</span>
      </div>

      <div className="flex gap-4 items-center">
        {role === "patient" && (
          <>
            <Link to="/dashboard" className="hover:underline">
              Mis citas
            </Link>
            <Link to="/dashboard/fisio" className="hover:underline">
              Fisioterapeutas
            </Link>
          </>
        )}
        {role === "therapist" && (
          <>
            <Link to="/dashboard" className="hover:underline">
              Agenda
            </Link>
            <Link to="/dashboard/pacientes" className="hover:underline">
              Pacientes
            </Link>
          </>
        )}
        {role === "admin" && (
          <>
            <Link to="/dashboard" className="hover:underline">
              Usuarios
            </Link>
            <Link to="/dashboard/estadisticas" className="hover:underline">
              Estadísticas
            </Link>
          </>
        )}
        <button
          onClick={handleLogout}
          className="bg-white text-teal-700 font-semibold px-3 py-1 rounded hover:bg-gray-100 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
