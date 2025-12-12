import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, PlusCircle, History, Clock, MapPin, User, ArrowRight } from "lucide-react";
import api from "../../../services/api";

export default function PacienteDashboard() {
  const [user, setUser] = useState({});
  const [proximaCita, setProximaCita] = useState(null);
  const [stats, setStats] = useState({ total: 0, pendientes: 0, completadas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("fisioUser") || "{}").user;
    setUser(savedUser || {});

    async function fetchData() {
      try {
        // Obtenemos todas las citas del paciente
        const res = await api.get("/api/citas");
        const citas = res.data;

        // 1. Calcular estadísticas
        const completadas = citas.filter(c => c.estado === 'completada').length;
        const pendientes = citas.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length;
        
        setStats({
          total: citas.length,
          completadas,
          pendientes
        });

        // 2. Buscar la PRÓXIMA cita futura
        const ahora = new Date();
        const futuras = citas
          .filter(c => (c.estado === 'pendiente' || c.estado === 'confirmada') && new Date(c.startAt) > ahora)
          .sort((a, b) => new Date(a.startAt) - new Date(b.startAt)); // Ordenar por fecha más cercana

        if (futuras.length > 0) {
          setProximaCita(futuras[0]);
        }

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando tu panel...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            ¡Hola, {user.nombre}! 👋
          </h1>
          <p className="text-teal-100 text-lg">
            Bienvenido a tu panel de salud. ¿Cómo te encuentras hoy?
          </p>
        </div>

        <div className="relative z-10 mt-6 md:mt-0 flex gap-4">
          <Link 
            to="/dashboard/paciente/reservar" 
            className="bg-white text-teal-800 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-teal-50 transition-transform transform hover:scale-105 flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Nueva Cita
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUMNA IZQUIERDA (2/3): Próxima Cita y Accesos --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TARJETA PRÓXIMA CITA */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-teal-600" /> Tu Próxima Cita
            </h2>
            
            {proximaCita ? (
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-8 border-teal-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-xl">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                    {new Date(proximaCita.startAt).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {new Date(proximaCita.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </h3>
                  
                  <div className="flex flex-col gap-1 text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-teal-600" />
                      <span>Fisio: <strong>{proximaCita.fisioterapeuta?.nombre} {proximaCita.fisioterapeuta?.apellido}</strong></span>
                    </div>
                    {proximaCita.motivo && (
                      <p className="text-sm italic text-gray-500 mt-1">"{proximaCita.motivo}"</p>
                    )}
                  </div>
                </div>

                <Link 
                  to="/dashboard/paciente/citas"
                  className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-teal-600 hover:text-white transition-colors flex items-center gap-2"
                >
                  Ver detalles <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-md text-center border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Calendar size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">No tienes citas programadas</h3>
                <p className="text-gray-500 mb-6">¿Sientes alguna molestia? Reserva una sesión ahora.</p>
                <Link to="/dashboard/paciente/reservar" className="text-teal-600 font-bold hover:underline">
                  Reservar ahora &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Link to="/dashboard/paciente/citas" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Mi Calendario</h3>
                <p className="text-sm text-gray-500">Consulta tus citas pasadas y futuras.</p>
              </Link>

              <Link to="/dashboard/paciente/reservar" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PlusCircle size={24} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Reservar Cita</h3>
                <p className="text-sm text-gray-500">Busca hueco y agenda tu sesión en segundos.</p>
              </Link>

            </div>
          </div>

        </div>

        {/* --- COLUMNA DERECHA (1/3): Resumen --- */}
        <div className="space-y-8">
          
          {/* TARJETA RESUMEN */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <History size={20} className="text-teal-600"/> Tu Actividad
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Total Sesiones</span>
                <span className="font-bold text-xl text-gray-800">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl text-green-800">
                <span className="font-medium">Completadas</span>
                <span className="font-bold text-xl">{stats.completadas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl text-blue-800">
                <span className="font-medium">Pendientes</span>
                <span className="font-bold text-xl">{stats.pendientes}</span>
              </div>
            </div>
          </div>

          {/* BANNER PROMO O INFO */}
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <h4 className="font-bold text-orange-800 mb-2">💡 ¿Sabías que?</h4>
            <p className="text-sm text-orange-700 leading-relaxed">
              La constancia es clave en la fisioterapia. Intenta no espaciar demasiado tus sesiones para una recuperación óptima.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}