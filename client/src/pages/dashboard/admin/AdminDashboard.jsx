import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useSelector } from "react-redux";
import EventosTimeline from "../../../components/admin/EventosTimeline";
import DistribucionHoraria from "../../../components/admin/DistribucionHoraria";
import HeatmapSemanal from "../../../components/admin/HeatmapSemanal";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";




export default function AdminDashboard() {
  const { user } = useSelector((state) => state.user);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fechaActualizacion, setFechaActualizacion] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
    const [citas, setCitas] = useState([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setMensaje("");

      const res = await api.get("/api/admin/stats");

      setStats(res.data);
      setFechaActualizacion(new Date().toLocaleString());
    } catch (err) {
      console.error("Error al obtener estadísticas:", err);
      setMensaje("Error al cargar estadísticas");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventos = async () => {
    try {
      setLoadingEventos(true);
      const res = await api.get("/api/admin/eventos-recientes");
      setEventos(res.data || []);
    } catch (err) {
      console.error("Error al obtener eventos recientes:", err);
    } finally {
      setLoadingEventos(false);
    }
  };

  const fetchCitas = async () => {
    try {
      const res = await api.get("/api/citas");
      setCitas(res.data || []);
    } catch (err) {
      console.error("Error al obtener citas:", err);
    }
  };



  useEffect(() => {
    fetchStats();
    fetchEventos();
    fetchCitas();
  }, []);

  // === KPI: % de citas completadas este mes ===
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const añoActual = ahora.getFullYear();

  const citasEsteMes = citas.filter((c) => {
    const d = new Date(c.startAt);
    return d.getMonth() === mesActual && d.getFullYear() === añoActual;
  });

  const completadasEsteMes = citasEsteMes.filter(
    (c) => c.estado === "completada"
  );

  const kpiCompletadas = completadasEsteMes.length;

  // Filtrar citas pendientes
  const pendientesEsteMes = citasEsteMes.filter(c => c.estado === "pendiente");
  // Mostrar el número de citas pendientes
  const citasPendientes = pendientesEsteMes.length;

  // === KPI: Ratio de cancelación total ===
  // Filtrar las citas canceladas en el mes actual
  const canceladasEsteMes = citasEsteMes.filter((c) => c.estado === "cancelada");

  // Calcular el ratio de cancelación para el mes actual
  const kpiCancelacion =
    citasEsteMes.length > 0
      ? Math.round((canceladasEsteMes.length / citasEsteMes.length) * 100)
      : 0;

  // === Distribución horaria de citas ===
  const horas = Array.from({ length: 13 }, (_, i) => {
  const h = i + 8; // empieza en 8 (08:00)
    return {
      hora: `${String(h).padStart(2, "0")}:00`,
      count: 0,
    };
  });

  citas.forEach((c) => {
    const h = new Date(c.startAt).getHours();
    if (h >= 8 && h <= 20) {
      horas[h - 8].count += 1;
    }
  });

  // Heatmap
  const horasInicio = 8;
  const horasFin = 20;

  const heatmap = Array.from(
    { length: horasFin - horasInicio },
    () => Array.from({ length: 5 }, () => ({ count: 0 }))
  );

  citas.forEach((c) => {
    const d = new Date(c.startAt);
    const dia = d.getDay(); // 1=Lun … 5=Vie
    const hora = d.getHours();
    if (dia < 1 || dia > 5) return;
    if (hora < horasInicio || hora >= horasFin) return;

    const row = hora - horasInicio;
    const col = dia - 1;

    heatmap[row][col].count += 1;
  });



  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Panel del Administrador
      </h1>

      <p className="text-gray-600 mb-6">
        Desde aquí puedes gestionar usuarios y supervisar la actividad general del sistema.
      </p>

      {mensaje && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 shadow">
          {mensaje}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <p className="text-sm text-gray-500">
          Última actualización: {fechaActualizacion || "Cargando..."}
        </p>

        <button
          onClick={fetchStats}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition shadow-sm"
        >
          Actualizar estadísticas
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando estadísticas...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-sm uppercase font-semibold opacity-80">Usuarios Totales</h2>
            <p className="text-4xl font-bold mt-2">{stats?.totalUsuarios ?? "-"}</p>
          </div>

          <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-sm uppercase font-semibold opacity-80">Fisioterapeutas</h2>
            <p className="text-4xl font-bold mt-2">{stats?.totalFisio ?? "-"}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-sm uppercase font-semibold opacity-80">Clientes</h2>
            <p className="text-4xl font-bold mt-2">{stats?.totalClientes ?? "-"}</p>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-sm uppercase font-semibold opacity-80">Administradores</h2>
            <p className="text-4xl font-bold mt-2">{stats?.totalAdmins ?? "-"}</p>
          </div>

        </div>
      )}

      {/* KPIs adicionales (citas) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">

        {/* KPI % Completadas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">
              Citas completadas este mes
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              {kpiCompletadas} citas
            </p>
          </div>
        </div>



        {/* KPI Citas pendientes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-xl font-bold">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">
              Citas pendientes este mes
            </p>
            <p className="text-3xl font-bold text-yellow-600">
              {citasPendientes}
            </p>
          </div>
        </div>


        {/* KPI Ratio de cancelación */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl font-bold">
          <XCircleIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">
            Ratio de cancelación
          </p>
          <p className="text-3xl font-bold text-red-600">
            {kpiCancelacion}%
          </p>
        </div>
      </div>


      </div>


      {/* Sección de eventos recientes */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Eventos recientes</h2>

        {loadingEventos ? (
          <p className="text-gray-500">Cargando eventos...</p>
        ) : (
          <EventosTimeline eventos={eventos} />
        )}
      </div>



      {/* Gráficos (Distribución + Heatmap) uno al lado del otro con misma altura real) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">

        {/* Gráfico de barras */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-[500px] flex flex-col">
          
          {/* Título */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Distribución horaria de citas
          </h2>

          {/* Contenedor del gráfico */}
          <div className="flex-1">
            <DistribucionHoraria data={horas} />
          </div>

        </div>

        {/* Heatmap */}
        <div className="bg-white p-0 rounded-2xl shadow-lg border border-gray-200 h-[500px] flex">
          <div className="flex-1 h-full p-6 overflow-hidden">
            <HeatmapSemanal data={heatmap} />
          </div>
        </div>

      </div>


  

      
      




      <div className="mt-10">
        <a
          href="/dashboard/admin/usuarios"
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-3 rounded-lg shadow transition"
        >
          Ir a gestión de usuarios
        </a>
      </div>
    </div>
  );
}
