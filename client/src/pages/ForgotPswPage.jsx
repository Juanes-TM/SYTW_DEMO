import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Clipboard } from "lucide-react";

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
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { }
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

      let returnedToken = res.data?.token || "";
      if (!returnedToken && res.data?.resetLink) {
        returnedToken = extractTokenFromResetLink(res.data.resetLink);
      }

      setMsg(res.data?.msg || "Token generado correctamente.");

      if (returnedToken) {
        setToken(returnedToken);
      } else {
        setToken("");
      }
    } catch (err) {
      console.error("ForgotPassword error:", err);
      const backendMsg = err.response?.data?.msg;
      setError(backendMsg || "Error inesperado al generar token");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 mb-6 shadow-md transform transition hover:scale-105">
          <KeyRound size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Recuperar contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Introduce tu correo para obtener el token de recuperación.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition placeholder-gray-400"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-100 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 hover:shadow-teal-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              Generar Token
            </button>
          </form>

          {/* Mensajes de Feedback */}
          {msg && !error && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 border border-green-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">{msg}</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* TOKEN GENERADO */}
          {token && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Token de Recuperación
              </p>
              
              <div className="relative">
                <textarea
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm font-mono text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                  value={token}
                  rows={3}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await safeCopyToClipboard(token);
                    if (ok) {
                      setMsg("Token copiado al portapapeles");
                      setTimeout(() => setMsg(""), 1800);
                    } else {
                      setError("No se pudo copiar automáticamente");
                    }
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-500 transition"
                  title="Copiar"
                >
                  <Clipboard size={16} />
                </button>
              </div>

              <button
                type="button"
                className="mt-3 w-full bg-teal-100 text-teal-700 font-bold py-2.5 rounded-lg hover:bg-teal-200 transition shadow-sm"
                onClick={() => navigate("/reset-password", { state: { token, email } })}
              >
                Ir a restablecer contraseña &rarr;
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true }) }
              className="w-full flex justify-center items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Volver al inicio de sesión
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}