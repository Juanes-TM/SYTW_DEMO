// client/src/pages/ValoracionPage.jsx
import { useState, useEffect } from "react";
import { crearValoracion } from "../services/valoracionesService";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";

export default function ValoracionPage() {
  const [form, setForm] = useState({
    fisioId: "",
    puntuacion: 5,
    comentario: "",
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();
  const { fisioId } = useParams();

  useEffect(() => {
    if (fisioId) {
      setForm((f) => ({ ...f, fisioId }));
    }
  }, [fisioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    const payload = {
      fisioId: form.fisioId,
      puntuacion: form.puntuacion,
      comentario: form.comentario,
      especialidad: "general",
    };

    try {
      setEnviando(true);
      await crearValoracion(payload);
      setMsg("¡Gracias por tu valoración!");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(err.response?.data?.msg || "Error enviando la valoración");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl p-8">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Dejar valoración
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Tu opinión ayuda a mejorar la calidad del servicio
        </p>

        {/* ⭐ PUNTUACIÓN */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Puntuación
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm({ ...form, puntuacion: n })}
                className="focus:outline-none"
              >
                <Star
                  size={32}
                  className={`transition ${
                    n <= form.puntuacion
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ✍️ COMENTARIO */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentario (opcional)
          </label>
          <textarea
            rows={4}
            maxLength={500}
            value={form.comentario}
            onChange={(e) =>
              setForm({ ...form, comentario: e.target.value })
            }
            placeholder="Cuéntanos tu experiencia..."
            className="w-full border border-gray-300 rounded-xl px-4 py-2 resize-none focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {form.comentario.length}/500
          </p>
        </div>

        {/* MENSAJES */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}
        {msg && (
          <div className="mb-4 bg-green-50 text-green-700 text-sm p-3 rounded-lg">
            {msg}
          </div>
        )}

        {/* BOTONES */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={enviando}
            className={`px-6 py-2 rounded-lg text-white font-medium transition ${
              enviando
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {enviando ? "Enviando..." : "Enviar valoración"}
          </button>
        </div>
      </div>
    </div>
  );
}
