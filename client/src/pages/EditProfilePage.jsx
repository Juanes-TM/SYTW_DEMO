import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/userService";
import { useNavigate } from "react-router-dom";
// Importamos iconos para mejorar la interfaz de los inputs
import { FaUser, FaPhone, FaSave, FaTimes, FaSpinner, FaEnvelope } from 'react-icons/fa';

export default function EditProfilePage() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "", // Nuevo campo de email en el estado
    telephone: ""
  });
  
  // Nuevo estado para manejar errores de validación
  const [errors, setErrors] = useState({});
  
  // Estados para manejo de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  
  const navigate = useNavigate();

  // Función de Validación Adaptada
  const validate = (data) => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    
    // Validar Email
    if (!emailRegex.test(data.email)) {
      newErrors.email = "Formato de correo inválido";
    }

    // Validar Teléfono (exactamente 9 dígitos)
    // Usamos el mismo regex que tenías: /^[0-9]{9}$/
    if (!/^[0-9]{9}$/.test(data.telephone)) {
      newErrors.telephone = "Debe contener exactamente 9 dígitos";
    }

    return newErrors;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    async function cargar() {
      try {
        const data = await getProfile();
        setForm({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          email: data.email || "", // Cargar el email
          telephone: data.telephone || "",
        });
      } catch (error) {
        console.error("Error cargando datos", error);
        setMsg("Error al cargar los datos del usuario.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
    
    // Limpiar error específico y el mensaje general si el usuario edita
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: "" }));
    }
    if (msg) setMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Ejecutar Validación
    const validationErrors = validate(form);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Muestra un mensaje general si hay errores, además de los específicos del campo
      setMsg("Por favor, corrige los errores en el formulario."); 
      return; 
    }
    
    setSaving(true);
    setErrors({}); // Limpia errores si todo es válido
    setMsg("");

    try {
      // 2. Enviar actualización al servicio
      const res = await updateProfile(form);

      if (!res.ok) {
        setMsg(res.msg || "Error al actualizar el perfil.");
        setSaving(false);
        return;
      }

      // Éxito: Navegar de vuelta al perfil
      navigate("/profile", { replace: true });
      
    } catch (error) {
      console.error(error);
      setMsg("Ocurrió un error inesperado al guardar los cambios.");
      setSaving(false);
    }
  };

  // Renderizado de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-teal-600 font-medium animate-pulse">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md overflow-hidden border-t-4 border-teal-600">
        
        {/* Encabezado */}
        <div className="bg-teal-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Editar Perfil</h2>
          <p className="text-teal-100 text-sm mt-1">Actualiza tu información personal</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Mensaje de Error / Estado General */}
          {msg && (
            <div className={`p-3 rounded-md text-sm border ${
              msg.includes("Error") || msg.includes("corrige") 
                ? "bg-red-50 text-red-600 border-red-200" 
                : "bg-teal-50 text-teal-600 border-teal-200"
            }`}>
              {msg}
            </div>
          )}

          <div className="space-y-4">
            {/* Input Nombre */}
            <InputField 
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              icon={<FaUser />}
              placeholder="Tu nombre"
              error={errors.nombre}
            />

            {/* Input Apellido */}
            <InputField 
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              icon={<FaUser />}
              placeholder="Tu apellido"
              error={errors.apellido}
            />

            {/* Input Email (Nuevo) */}
            <InputField 
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              icon={<FaEnvelope />}
              type="email"
              placeholder="correo@ejemplo.com"
              error={errors.email} // Mostrar error de validación
            />

            {/* Input Teléfono */}
            <InputField 
              label="Teléfono (9 dígitos)"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              icon={<FaPhone />}
              type="tel"
              placeholder="Ej: 600123456"
              error={errors.telephone} // Mostrar error de validación
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/profile", { replace: true })}
              disabled={saving}
              className="w-1/2 flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50"
            >
              <FaTimes /> Cancelar
            </button>

            <button 
              type="submit" 
              disabled={saving}
              className="w-1/2 flex justify-center items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium shadow-md disabled:bg-teal-400"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// Componente reutilizable para los Inputs con Icono
// Modificado para recibir y mostrar el error
function InputField({ label, name, value, onChange, icon, type = "text", placeholder, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          // Clases dinámicas para resaltar el borde si hay un error
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 placeholder-gray-400 text-gray-800 ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
          }`}
        />
      </div>
      {/* Mensaje de error específico */}
      {error && (
        <p className="text-red-500 text-sm mt-1 ml-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}