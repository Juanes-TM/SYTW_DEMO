// client/src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setToken("");

    try {
      const res = await api.post("/api/forgot-password", { email });
      setMsg(res.data.msg || "Token generado correctamente.");
      setToken(res.data.resetToken || "");
    } catch (err) {
      console.error("ForgotPassword error full:", err);
      const status = err.response?.status;
      const data = err.response?.data;
      setError(
        data?.msg
          || `Error: ${status || ""} - ${err.message}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Recuperar contraseña</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-1 font-medium text-gray-700">Correo electrónico</label>
          <input
            type="email"
            className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Generar Token
          </button>
        </form>

        {msg && <p className="text-green-600 mt-4">{msg}</p>}
        {error && <pre className="text-red-600 mt-4 whitespace-pre-wrap">{error}</pre>}

        {token && (
          <div className="mt-5 p-4 bg-gray-50 border rounded">
            <p className="font-semibold mb-2">Tu token de recuperación:</p>
            <textarea readOnly className="w-full p-2 border rounded bg-white" value={token} rows={3} />
            <button
              type="button"
              className="mt-2 w-full bg-gray-700 text-white py-1 rounded"
              onClick={() => navigator.clipboard.writeText(token)}
            >
              Copiar Token
            </button>

            <button
              type="button"
              className="mt-2 w-full bg-transparent text-blue-600 py-2 rounded underline"
              onClick={() => navigate("/reset-password")}
            >
              Ir a restablecer contraseña
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
