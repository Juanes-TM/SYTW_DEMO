// client/src/pages/ResetPasswordPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResetPasswordPage() {
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
      const res = await api.post(`/api/reset-password`, { 
        email,
        token,
        newPassword: password 
      });
      setMsg(res.data.msg || "Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("ResetPassword error full:", err);
      const status = err.response?.status;
      const data = err.response?.data;
      setError(
        data?.msg || `Error: ${status || ""} - ${err.message}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Restablecer contraseña</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-1 font-medium text-gray-700">Token</label>
          <textarea
            className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={2}
            placeholder="Pega aquí el token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <label className="block mb-1 font-medium text-gray-700">Nueva contraseña</label>
          <input
            type="password"
            className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Restablecer
          </button>
        </form>

        {msg && <p className="text-green-600 mt-4">{msg}</p>}
        {error && <pre className="text-red-600 mt-4 whitespace-pre-wrap">{error}</pre>}
      </div>
    </div>
  );
}
