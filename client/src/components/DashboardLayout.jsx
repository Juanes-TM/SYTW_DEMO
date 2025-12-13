import { Outlet, Link, useNavigate } from "react-router-dom";
import { LogOut, Home, Calendar, User, Users, Settings, Star, CalendarOff} from "lucide-react";
import NotificacionesBell from './NotificacionesBell';


export default function DashboardLayout() {
  const navigate = useNavigate();

  const saved = JSON.parse(localStorage.getItem("fisioUser") || "{}");
  const currentUser = saved.user || {};
  
  // No necesitamos 'token' aquí para renderizar, pero si lo usas para otras cosas está bien.
  // const token = saved.token || localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("fisioUser");
    localStorage.removeItem("token");
    localStorage.removeItem("lastFisioId");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* === SIDEBAR (Barra Lateral Izquierda) === */}
      <aside 
        className="w-64 text-white flex flex-col shadow-lg fixed h-full top-0 left-0 z-20"
        style={{
          backgroundImage: 'url(/img/fisiotrack-bg-waves-last.png)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#0f766e' // Color de fondo por si falla la imagen (Teal-700)
        }}
      >
        {/* Logo */}
        <div className="flex justify-center p-4 text-2xl font-semibold border-b border-teal-500/30 backdrop-blur-sm">
          {/* Si no tienes la imagen, pon un texto provisional o asegúrate de que la ruta sea correcta */}
          <img src="/img/fisiotrack-logo-white.png" alt="FisioTrack" className="w-28 mb-2" />
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* PACIENTE */}
          {currentUser.rol === "cliente" && (
            <>
              <Link to="/dashboard/paciente" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition">
                <Home size={20} />
                <span>Inicio</span>
              </Link>
              <Link to="/dashboard/paciente/reservar" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition">
                <Calendar size={20} />
                <span>Reservar cita</span>
              </Link>
              <Link to="/dashboard/paciente/citas" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition">
                <Calendar size={20} />
                <span>Calendario</span>
              </Link>
              <Link 
                to="/dashboard/fisioterapeutas" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition"
              >
                <Users size={20} />
                <span>Nuestro Equipo</span>
              </Link>
              <Link 
                to="/dashboard/resenas" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition"
              >
                <Star size={20} />
                <span>Reseñas</span>
              </Link>

            </>
          )}

          {/* FISIO */}
          {currentUser.rol === "fisioterapeuta" && (
            <>
              <Link to="/dashboard/fisio" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition">
                <User size={20} />
                <span>Panel Info</span>
              </Link>
              <Link to="/dashboard/fisio/disponibilidad" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition">
                <Calendar size={20} />
                <span>Disponibilidad</span>
              </Link>
              <Link to="/dashboard/fisio/bloqueos" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition">
                <CalendarOff size={20} />
                <span>Mis Ausencias</span>
              </Link>
              <Link 
                to="/dashboard/fisioterapeutas" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition"
              >
                <Users size={20} />
                <span>Nuestro Equipo</span>
              </Link>
              <Link 
                to="/dashboard/resenas" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition"
              >
                <Star size={20} />
                <span>Reseñas</span>
              </Link>
            </>
          )}

          {/* ADMIN */}
          {currentUser.rol === "admin" && (
            <>
              <Link to="/dashboard/admin" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition">
                <Settings size={20} />
                <span>Admin Panel</span>
              </Link>
              <Link to="/dashboard/admin/usuarios" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition">
                <Users size={20} />
                <span>Usuarios</span>
              </Link>
              <Link 
                to="/dashboard/fisioterapeutas" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-500 transition"
              >
                <Users size={20} />
                <span>Nuestro Equipo</span>
              </Link>
              <Link 
                to="/dashboard/resenas" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition"
              >
                <Star size={20} />
                <span>Reseñas</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer del Sidebar (Info Usuario + Logout) */}
        <div className="p-4 border-t border-teal-500/30 bg-black/10 backdrop-blur-sm">
          {currentUser.nombre && (
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <User size={24} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{currentUser.nombre} {currentUser.apellido}</p>
                <p className="text-xs text-teal-100 capitalize">{currentUser.rol}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600/90 hover:bg-red-700 rounded text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Espaciador para el sidebar fijo */}
      <div className="w-64 flex-shrink-0 hidden md:block"></div>

      {/* === ZONA PRINCIPAL === */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* 1. HEADER SUPERIOR */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6 z-10">
          <h2 className="text-xl font-bold text-gray-700 capitalize">
             {/* Título dinámico simple */}
             Panel de {currentUser.rol}
          </h2>

          <div className="flex items-center gap-6">
            {/* --- CAMPANA DE NOTIFICACIONES DE CITAS --- */}
            <div className="relative">
               <NotificacionesBell />
            </div>

            {/* Saludo simple */}
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-medium text-gray-700">Hola, {currentUser.nombre}</span>
              <span className="block text-xs text-gray-400 text-right">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        {/* 2. CONTENIDO SCROLLEABLE */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}