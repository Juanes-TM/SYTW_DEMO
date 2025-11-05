import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../redux/userSlice";
import api from "../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/api/login", { email, password });
      const { user, token } = res.data;

      // Guardar en Redux
      dispatch(loginSuccess({ user, token }));

      // Guardar también en localStorage para mantener la sesión
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));

      // Redirigir según el rol del usuario
      if (user.rol === "admin") navigate("/dashboard/admin");
      else if (user.rol === "fisioterapeuta") navigate("/dashboard/fisio");
      else navigate("/dashboard/paciente");
    } catch (err) {
      alert("Credenciales incorrectas o error de conexión");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-100 to-teal-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 text-center">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6">FisioTrack</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 outline-none"
          />
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold transition"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
