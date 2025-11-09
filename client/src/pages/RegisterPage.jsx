import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    password2: "",	  
    telephone: "",
  });
  const [errors, setErrors] = useState({});	
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validaciones nuevas
  const validate = () => {
	  const newErrors = {};
	  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
		  newErrors.email = "Formato de correo inválido";

	  if (formData.password.length < 6)
		  newErrors.password = "La contraseña debe tener mínimo 6 caracteres";
	  if (formData.password !== formData.password2)
		  newErrors.password2 = "Las contraseñas no coinciden";

	  if (!/^[0-9]{9}$/.test(formData.telephone))
		  newErrors.telephone = "Debe contener exactamente 9 dígitos";

	  return newErrors;
  };




  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  
  
    setErrors({
	  ...errors,
	  [e.target.name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
	    setErrors(validationErrors);
	    return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/register", formData);
      alert(res.data.msg || "Usuario registrado correctamente");

      // Tras el registro, redirige al login
      navigate("/login");
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      alert("Error en el registro. Verifica los campos o el servidor.");
    } finally {
      setLoading(false);
    }
  };
  

  // EStilo dinámico del input
  const inputStyle = (field) =>
	`w-full px-4 py-2 border rounded-md outline-none ${
	errors[field]
	? "border-red-500 focus:ring-2 focus:ring-red-400"
	: "border-gray-300 focus:ring-2 focus:ring-teal-400"
	}`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-100 to-teal-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 text-center">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6">
          Crear cuenta
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
	    className={inputStyle("nombre")}
            //required
            //className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
          <input
            name="apellido"
            type="text"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
	    className={inputStyle("apellido")}
            //required
            //className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
	    className={inputStyle("email")}
            //required
            //className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
	  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
	    className={inputStyle("password")}
            //required
            //className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
		
          <input
	    name="password2"
	    type="password"
	    placeholder="Repetir contraseña"
	    value={formData.password2}
	    onChange={handleChange}
	    className={inputStyle("password2")}
	  />
          {errors.password2 && <p className="text-red-500 text-sm">{errors.password2}</p>}


          <input
            name="telephone"
            type="tel"
            placeholder="Teléfono"
            value={formData.telephone}
            onChange={handleChange}
	    className={inputStyle("telephone")}
            //required
            //className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
          {errors.telephone && <p className="text-red-500 text-sm">{errors.telephone}</p>}


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold transition"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-teal-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
