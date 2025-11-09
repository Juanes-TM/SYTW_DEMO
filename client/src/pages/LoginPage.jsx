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

    // email inválido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Correo no válido";

    if (!password)
      newErrors.password = "Debes escribir tu contraseña";

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

      // Guardar en Redux y en localStorage
      dispatch(loginSuccess({ user, token }));
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));

      // Redirigir según rol
      if (user.rol === "admin") navigate("/dashboard/admin");
      else if (user.rol === "fisioterapeuta") navigate("/dashboard/fisio");
      else navigate("/dashboard/paciente");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Credenciales incorrectas" });
      {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
    }
  };


  const inputStyle = (fieldError) =>
    `w-full px-4 py-2 border rounded-md outline-none ${
      fieldError
      ? "border-red-500 focus:ring-2 focus:ring-red-400"
      : "border-gray-300 focus:ring-2 focus:ring-teal-400"
    }`;


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-100 to-teal-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 text-center">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6">FisioTrack</h2>

        {/* ===== FORMULARIO DE LOGIN ===== */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: "" });
            }}
            className={inputStyle(errors.email)}
            //className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}


          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: "" });
            }}
            className={inputStyle(errors.password)}
            //className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          {errors.general && (<p className="text-red-500 text-sm">{errors.general}</p>)}


          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold transition"
          >
            Iniciar sesión
          </button>
        </form>

        {/* ===== ENLACES DE REGISTRO Y RECUPERACIÓN ===== */}
        <div className="mt-4 text-sm flex flex-col items-center space-y-2">
          <Link
            to="/register"
            className="text-teal-700 hover:underline"
          >
            Crear una cuenta nueva
          </Link>
          
          {/* Este botón aún no tiene funcionalidad, FUTURO RECUPERAR CONTRASEÑA */}
          <button
            type="button"
            onClick={() => alert('Funcionalidad de recuperación de contraseña aun sin vincular')}
            //onClick={() => navigate('/forgot-password')}
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
