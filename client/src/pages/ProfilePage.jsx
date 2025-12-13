import { useEffect, useState } from "react";
import { getProfile } from "../services/userService";
import { useNavigate } from "react-router-dom";
// Importar iconos para los campos del perfil
import { FaEnvelope, FaPhone, FaBriefcase, FaArrowLeft, FaEdit } from 'react-icons/fa';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarPerfil() {
      try {
        setLoading(true); 
        const data = await getProfile();
        setUser(data);
        setError(null);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError("No se pudo cargar la información del perfil.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    cargarPerfil();
  }, []);

  // 1. Estado de Carga
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl font-medium text-teal-600">Cargando perfil profesional...</p>
      </div>
    );
  }

  // 2. Estado de Error
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center transition duration-150"
        >
          <FaArrowLeft className="mr-2" />
          Volver
        </button>
      </div>
    );
  }

  // 3. Estado con Perfil Cargado
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden transform transition duration-500 hover:scale-[1.01] border-t-4 border-teal-600">
        
        {/* Encabezado de la Tarjeta */}
        <div className="p-8 bg-teal-600 text-white">
          {/* CAMBIO AQUI: font-bold para negrita */}
          <h2 className="text-3xl font-bold mb-1">
            {user.nombre} {user.apellido}
          </h2>
          <p className="text-lg font-light opacity-90">{user.rol}</p>
        </div>

        {/* Cuerpo de la Información */}
        <div className="p-8 space-y-5">
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Detalles de Contacto</h3>

          <DetailItem 
            icon={<FaEnvelope className="text-teal-600" />} 
            label="Email Profesional" 
            value={user.email} 
          />
          <DetailItem 
            icon={<FaPhone className="text-teal-600" />} 
            label="Teléfono" 
            value={user.telephone} 
          />
          <DetailItem 
            icon={<FaBriefcase className="text-teal-600" />} 
            label="Rol de Usuario" 
            value={user.rol} 
          />
        </div>

        {/* Pie de Página y Botones */}
        <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={() => navigate("/profile/edit")}
            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center space-x-2"
          >
            <FaEdit />
            <span>Editar Perfil</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center space-x-2"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-componente para detalles
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start space-x-4 border-l-4 border-teal-300 pl-4 py-1">
      <div className="flex-shrink-0 text-xl mt-1">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-medium text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}