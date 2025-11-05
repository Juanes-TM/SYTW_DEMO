import { Outlet, Link, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-teal-700 text-white flex flex-col justify-between">
        <div>
          <div className="p-4 text-2xl font-semibold border-b border-teal-600">
            FisioTrack
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {user.rol === "cliente" && (
              <Link
                to="/dashboard/paciente"
                className="block px-3 py-2 rounded hover:bg-teal-600"
              >
                Panel del Paciente
              </Link>
            )}
            {user.rol === "fisioterapeuta" && (
              <>
                <Link
                  to="/dashboard/fisio"
                  className="block px-3 py-2 rounded hover:bg-teal-600"
                >
                  Panel del Fisio
                </Link>
                <Link
                  to="/dashboard/disponibilidad"
                  className="block px-3 py-2 rounded hover:bg-teal-600"
                >
                  Disponibilidad
                </Link>
              </>
            )}
            {user.rol === "admin" && (
              <>
                <Link
                  to="/dashboard/admin"
                  className="block px-3 py-2 rounded hover:bg-teal-600"
                >
                  Panel del Admin
                </Link>
                <Link
                  to="/dashboard/usuarios"
                  className="block px-3 py-2 rounded hover:bg-teal-600"
                >
                  Gestión de usuarios
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-teal-600">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded mb-3"
          >
            Cerrar sesión
          </button>

          {user && user.nombre && (
            <div className="text-center text-sm text-teal-100">
              Sesión iniciada como
              <br />
              <span className="font-semibold">{user.nombre} ({user.rol})</span>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
