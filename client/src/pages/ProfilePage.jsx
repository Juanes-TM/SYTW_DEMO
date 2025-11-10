import { useEffect, useState } from "react";
import { getProfile } from "../services/userService";
import { useNavigate } from "react-router-dom";


export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      }
    }

    cargarPerfil();
  }, []);

  if (!user) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded-xl w-96">
        <h2 className="text-2xl font-bold text-teal-700 mb-4">Mi Perfil</h2>

        <p><strong>Nombre:</strong> {user.nombre}</p>
        <p><strong>Apellido:</strong> {user.apellido}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Teléfono:</strong> {user.telephone}</p>
        <p><strong>Rol:</strong> {user.rol}</p>

        <button
        onClick={() => navigate(-1)}
        className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold transition"
        >
          Volver a la página anterior
        </button>
      </div>
    </div>
  );
}
