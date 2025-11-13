import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccess } from "../redux/userSlice";
import api from "../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Correo no válido";
    if (!password) newErrors.password = "Debes escribir tu contraseña";
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    try {
      const res = await api.post("/api/login", { email, password });
      const { user, token } = res.data;

      // NORMALIZACIÓN UNIFICADA
      const userPayload = {
        user: {
          _id: user._id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
        },
        token: token,
      };

      // Guardar en redux y storage
      dispatch(loginSuccess(userPayload));
      localStorage.setItem("fisioUser", JSON.stringify(userPayload));
      localStorage.setItem("token", token);

      // Redirigir
      if (user.rol === "admin") navigate("/dashboard/admin");
      else if (user.rol === "fisioterapeuta") navigate("/dashboard/fisio");
      else navigate("/dashboard/paciente");

    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Credenciales incorrectas",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-100 to-teal-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 text-center">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6">FisioTrack</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold transition"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-4 text-sm flex flex-col items-center space-y-2">
          <Link to="/register" className="text-teal-700 hover:underline">
            Crear una cuenta nueva
          </Link>

          <button
            type="button"
            onClick={() => alert("Funcionalidad no implementada")}
            className="text-gray-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
