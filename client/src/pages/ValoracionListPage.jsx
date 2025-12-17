import { useEffect, useState } from 'react';
import { obtenerValoracionesFisio } from '../services/valoracionesService';
import { useParams, useNavigate } from 'react-router-dom';

export default function ValoracionesList() {
  const [valoraciones, setValoraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerValoracionesFisio(params.fisioId);
        setValoraciones(datos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (params.fisioId) cargar();
  }, [params.fisioId]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      
      {/* --- BOTÓN DE VOLVER --- */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-teal-700 transition-colors font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver atrás
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
          Opiniones de Pacientes
        </h2>
        
        {loading ? (
          <p className="text-center py-8 text-gray-500">Cargando opiniones...</p>
        ) : valoraciones.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">Este fisioterapeuta aún no tiene valoraciones.</p>
            <p className="text-sm text-gray-400 mt-1">¡Sé el primero en opinar tras tu cita!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {valoraciones.map(v => (
              <li key={v._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <strong className="text-gray-900 block">
                      {v.paciente?.nombre ? `${v.paciente.nombre} ${v.paciente.apellido}` : 'Paciente Anónimo'}
                    </strong>
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-medium border border-teal-100">
                      {v.especialidad}
                    </span>
                  </div>
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded text-yellow-700 font-bold">
                    <span className="text-lg mr-1">★</span> {v.puntuacion}
                  </div>
                </div>
                
                {v.comentario && (
                  <p className="text-gray-700 mt-2 text-sm leading-relaxed italic border-l-2 border-gray-300 pl-3">
                    "{v.comentario}"
                  </p>
                )}
                
                <div className="text-xs text-gray-400 mt-3 flex justify-end">
                  {new Date(v.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}