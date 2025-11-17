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

  const extractTokenFromResetLink = (resetLink) => {
    if (!resetLink) return "";
    try {
      const url = new URL(resetLink);
      const params = new URLSearchParams(url.search);
      return params.get("token") || "";
    } catch {
      const m = resetLink.match(/token=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : "";
    }
  };

  const safeCopyToClipboard = async (text) => {
    if (!text) return false;
    // Intentar API moderna
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      // fallthrough a fallback
    }
    // Fallback clásico
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      el.style.top = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return !!ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setToken("");

    try {
      const res = await api.post("/api/forgot-password", { email });

      // backend puede devolver res.data.token o res.data.resetLink
      let returnedToken = res.data?.token || "";
      if (!returnedToken && res.data?.resetLink) {
        returnedToken = extractTokenFromResetLink(res.data.resetLink);
      }

      // Si backend devolvió token vacío pero msg indica token creado,
      // mostramos mensaje y no habilitamos botones (evita falsos positivos)
      setMsg(res.data?.msg || "Token generado correctamente.");

      if (returnedToken) {
        setToken(returnedToken);
      } else {
        setToken("");
      }
    } catch (err) {
      console.error("ForgotPassword error:", err);
      const backendMsg = err.response?.data?.msg;
      // Forzar mensaje de error en rojo si backend dice que no existe
      setError(backendMsg || "Error inesperado al generar token");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Recuperar contraseña
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-1 font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Generar Token
          </button>
        </form>

        {msg && !error && (
          <p className="text-green-600 mt-4 font-semibold">{msg}</p>
        )}
        {error && (
          <p className="text-red-600 mt-4 font-semibold">{error}</p>
        )}

        {/* Si existe token, mostrar bloque con copiar + ir a reset */}
        {token && (
          <div className="mt-5 p-4 bg-gray-50 border rounded">
            <p className="font-semibold mb-2">Tu token de recuperación:</p>

            <textarea
              readOnly
              className="w-full p-2 border rounded bg-white"
              value={token}
              rows={3}
            />

            <button
              type="button"
              className="mt-2 w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800"
              onClick={async () => {
                const ok = await safeCopyToClipboard(token);
                if (ok) {
                  // pequeña notificación visual
                  setMsg("Token copiado al portapapeles");
                  setTimeout(() => setMsg(""), 1800);
                } else {
                  setError("No se pudo copiar el token automáticamente");
                }
              }}
            >
              Copiar Token
            </button>

            <button
              type="button"
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              onClick={() =>
                // Navegamos a /reset-password y pasamos token y email por state
                navigate("/reset-password", { state: { token, email } })
              }
            >
              Ir a restablecer contraseña
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


