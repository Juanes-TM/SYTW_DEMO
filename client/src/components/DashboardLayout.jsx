import { Outlet, Link, useNavigate } from "react-router-dom";
import { LogOut, Home, Calendar, User, Users, Settings } from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const saved = JSON.parse(localStorage.getItem("fisioUser") || "{}");
  const currentUser = saved.user || {};
  const token = saved.token || localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("fisioUser");
    localStorage.removeItem("token");
    localStorage.removeItem("lastFisioId");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside 
        className="w-64 text-white flex flex-col shadow-lg fixed h-full top-0 left-0 z-20"
        style={{
          backgroundImage: 'url(/img/fisiotrack-bg-waves-last.png)', // Imagen de fondo
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex justify-center p-4 text-2xl font-semibold border-b border-teal-600">
          <img src="/img/fisiotrack-logo-white.png" alt="FisioTrack Logo" className="w-28 mb-6" />
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* PACIENTE */}
          {currentUser.rol === "cliente" && (
            <>
              <Link to="/dashboard/paciente" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition">
                <Home size={20} />
                <span>Inicio</span>
              </Link>
              <Link to="/dashboard/paciente/reservar" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition">
                <Calendar size={20} />
                <span>Reservar cita</span>
              </Link>
              <Link to="/dashboard/paciente/citas" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition">
                <Calendar size={20} />
                <span>Calendario</span>
              </Link>
            </>
          )}

          {/* FISIO */}
          {currentUser.rol === "fisioterapeuta" && (
            <>
              <Link to="/dashboard/fisio" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition">
                <User size={20} />
                <span>Panel de Información</span>
              </Link>
              <Link to="/dashboard/fisio/disponibilidad" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition">
                <Calendar size={20} />
                <span>Disponibilidad</span>
              </Link>
            </>
          )}

          {/* ADMIN */}
          {currentUser.rol === "admin" && (
            <>
              <Link to="/dashboard/admin" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition">
                <Settings size={20} />
                <span>Panel del Admin</span>
              </Link>
              <Link to="/dashboard/admin/usuarios" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition">
                <Users size={20} />
                <span>Gestión de Usuarios</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bloque de sesión activa */}
        <div className="p-4 border-t border-teal-600 text-sm text-gray-100">
          {currentUser.nombre && (
            <div className="mb-4 flex items-center gap-6 bg-teal-550 bg-opacity-90 rounded-xl py-3 px-4 shadow-md hover:shadow-xl transition-all duration-300">
              {/* Icono de usuario */}
              <User size={28} className="text-white" />
              <div className="text-white">
                <p className="text-gray-300 text-xs uppercase tracking-wide mb-1">Sesión activa</p>
                <p className="font-semibold text-lg">{currentUser.nombre} {currentUser.apellido}</p>
                <p className="text-xs italic text-gray-400">Rol: {currentUser.rol}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded text-white font-semibold mt-4 transition-all transform hover:scale-105"
          >
            <LogOut size={18} className="inline-block mr-2" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="w-64 flex-shrink-0" aria-hidden="true"></div>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
