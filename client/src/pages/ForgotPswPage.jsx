import { useState } from "react";
import api from "../services/api";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setToken("");

    try {
      const res = await api.post("/auth/forgot-password", { email });

      setMsg(res.data.msg || "Token generado correctamente.");
      setToken(res.data.resetToken);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al generar token.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Recuperar contraseña</h2>

        <label className="block mb-2">Correo electrónico</label>
        <input
          type="email"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Generar Token
        </button>

        {msg && <p className="text-green-600 mt-3">{msg}</p>}
        {error && <p className="text-red-600 mt-3">{error}</p>}

        {token && (
          <div className="mt-4 bg-gray-100 p-3 rounded border">
            <p className="font-semibold mb-2">Tu token de recuperación:</p>
            <textarea
              readOnly
              className="w-full p-2 border rounded bg-white"
              value={token}
              rows={3}
            />

            <button
              type="button"
              className="mt-2 w-full bg-gray-700 text-white py-1 rounded"
              onClick={() => navigator.clipboard.writeText(token)}
            >
              Copiar Token
            </button>

            <p className="text-sm text-gray-600 mt-2">
              Copia este token y pégalo en la página de restablecimiento de contraseña.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
