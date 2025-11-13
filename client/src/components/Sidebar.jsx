import { Home, Calendar, Users, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  return (
    <aside className="w-60 bg-teal-600 text-white h-screen p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center">FisioTrack</h2>

        {user && (
          <div className="mb-6 text-center">
            <p className="font-semibold">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-sm opacity-80">{user.rol}</p>
          </div>
        )}

        <ul className="space-y-4">
          <li className="flex items-center gap-3 hover:bg-teal-700 p-2 rounded-md cursor-pointer">
            <Home size={20} />
            <span>Inicio</span>
          </li>

          <li className="flex items-center gap-3 hover:bg-teal-700 p-2 rounded-md cursor-pointer">
            <Calendar size={20} />
            <span>Citas</span>
          </li>

          {user?.rol === "fisioterapeuta" && (
            <li className="flex items-center gap-3 hover:bg-teal-700 p-2 rounded-md cursor-pointer">
              <Users size={20} />
              <span>Pacientes</span>
            </li>
          )}

          {user?.rol === "admin" && (
            <li className="flex items-center gap-3 hover:bg-teal-700 p-2 rounded-md cursor-pointer">
              <Users size={20} />
              <span>Administración</span>
            </li>
          )}
        </ul>
      </div>

      <button
        onClick={() => dispatch(logout())}
        className="flex items-center gap-3 text-sm hover:bg-teal-700 p-2 rounded-md"
      >
        <LogOut size={18} /> Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;
