import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
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
    if (prefillToken || prefillEmail) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 mb-6 shadow-md transform transition hover:scale-105">
          <Lock size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Restablecer contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Introduce el token y tu nueva clave.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* TOKEN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token de recuperación</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 sm:text-sm font-mono text-gray-600"
                placeholder="Pega aquí tu token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <div className="border-t border-gray-100 my-4 pt-4">
              {/* NUEVA CONTRASEÑA */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* CONFIRMAR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="******"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-100 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 hover:shadow-teal-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              Restablecer contraseña
            </button>

            <button
                type="button"
                onClick={() => navigate("/forgot-password", { replace: true }) }
                className="w-full mt-3 bg-white text-gray-500 font-medium py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition text-sm"
              >
                Cancelar
            </button>
          </form>

          {/* FEEDBACK */}
          {msg && (
            <div className="mt-6 rounded-lg bg-green-50 p-4 border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 text-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-bold">¡Éxito!</p>
                <p className="text-xs text-green-700">{msg}</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}