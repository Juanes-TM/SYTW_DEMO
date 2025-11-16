import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setMsg(res.data.msg || "Contraseña actualizada correctamente.");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Token inválido o expirado.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Restablecer contraseña</h2>

        <label className="block mb-2">Token recibido</label>
        <textarea
          className="w-full border p-2 rounded mb-3"
          rows={2}
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <label className="block mb-2">Nueva contraseña</label>
        <input
          type="password"
          className="w-full border p-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Restablecer contraseña
        </button>

        {msg && <p className="text-green-600 mt-3">{msg}</p>}
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </form>
    </div>
  );
}

export default ResetPasswordPage;
