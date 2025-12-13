import { useState, useEffect } from 'react';
import api from '../services/api';

export default function NotificacionesBell() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [abierto, setAbierto] = useState(false);

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    try {
      const res = await api.get('/api/notificaciones');
      setNotificaciones(res.data);
    } catch (error) {
      console.error("Error cargando notificaciones");
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    // Opcional: Polling cada 60 segundos para ver si hay nuevas sin recargar página
    const intervalo = setInterval(cargarNotificaciones, 60000); 
    return () => clearInterval(intervalo);
  }, []);

  // Filtrar las no leídas para el contador rojo
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const handleMarcarLeidas = async () => {
    if (noLeidas > 0) {
      await api.put('/api/notificaciones/leer-todas');
      // Actualizamos estado local
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    }
  };

  return (
    <div className="relative">
      {/* BOTÓN CAMPANA */}
      <button 
        onClick={() => {
          setAbierto(!abierto);
          if (!abierto) handleMarcarLeidas(); // Al abrir, marcamos como visto (opcional)
        }}
        className="relative p-2 text-gray-600 hover:text-teal-600 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        
        {/* PUNTITO ROJO si hay no leídas */}
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
            {noLeidas}
          </span>
        )}
      </button>

      {/* LISTA DESPLEGABLE */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[200] overflow-hidden">

          {/* HEADER FIJO */}
          <div className="sticky top-0 bg-white border-b px-4 py-3 z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">
                Notificaciones
              </span>
            </div>
          </div>

          {/* LISTA CON SCROLL */}
          <ul className="max-h-64 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <li className="p-4 text-center text-gray-500 text-sm">
                No tienes notificaciones
              </li>
            ) : (
              notificaciones.map(noti => (
                <li
                  key={noti._id}
                  className={`p-3 border-b text-sm ${
                    noti.leida ? 'bg-white opacity-60' : 'bg-blue-50'
                  }`}
                >
                  <p className="text-gray-800 font-medium">{noti.mensaje}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(noti.fecha).toLocaleDateString()} –{" "}
                    {new Date(noti.fecha).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

    </div>
  );
}