
// client/src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillToken = location.state?.token || "";
  const prefillEmail = location.state?.email || "";

  const [email, setEmail] = useState(prefillEmail);
  const [token, setToken] = useState(prefillToken);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // si venimos con state, limpiarlo (opcional)
    if (prefillToken || prefillEmail) {
      // replace para evitar volver con state al pulsar atrás
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!email || !token) {
      setError("Email y token son obligatorios");
      return;
    }
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await api.post("/api/reset-password", {
        email,
        token,
        newPassword: password
      });

      setMsg(res.data?.msg || "Contraseña restablecida correctamente");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      console.error("ResetPassword error:", err);
      const apiMsg = err.response?.data?.msg;
      setError(apiMsg || "Error al restablecer la contraseña");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Restablecer contraseña
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-1 font-medium text-gray-700">Correo electrónico</label>
          <input
            type="email"
            className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block mb-1 font-medium text-gray-700">Token de recuperación</label>
          <input
            type="text"
            className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Pega aquí tu token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />

          <label className="block mb-1 font-medium text-gray-700">Nueva contraseña</label>
          <input
            type="password"
            className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="block mb-1 font-medium text-gray-700">Confirmar contraseña</label>
          <input
            type="password"
            className="w-full border rounded p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Repite la contraseña"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Restablecer contraseña
          </button>
        </form>

        {msg && <p className="text-green-600 mt-4 font-semibold">{msg}</p>}
        {error && <p className="text-red-600 mt-4 font-semibold">{error}</p>}
      </div>
    </div>
  );
}
