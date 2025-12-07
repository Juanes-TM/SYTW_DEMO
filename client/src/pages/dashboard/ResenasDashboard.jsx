import { useState, useEffect } from "react";
import axios from "axios";
import { Star } from "lucide-react";

export default function ResenasDashboard() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaCarrusel, setPaginaCarrusel] = useState({});

  // 📌 MAPA DE FOTOS REALES DE FISIOS
  const fotoFisio = {
    Laura: "/img/fisio1_avatar_crop.png",
    Diego: "/img/fisio5_avatar_crop.png",
    Carlos: "/img/fisio3_avatar_crop.png",
    Maria: "/img/fisio4_avatar_crop.png",
    Javier: "/img/fisio2_avatar_crop.png",
    Sara: "/img/fisio6_avatar_crop.png",
    Fisio9: "/img/fisio6_avatar_crop.png"
  };

  useEffect(() => {
    async function cargar() {
      try {
        const res = await axios.get("/api/valoraciones/todas");
        setDatos(res.data.fisios);
      } catch (err) {
        console.error("Error cargando reseñas:", err);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) return <p className="p-4">Cargando reseñas...</p>;

  // ⭐ Render de estrellas
  const renderStars = (value) => {
    const n = Math.round(Number(value) || 0);
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            className={
              i < n
                ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  // TAMAÑO DEL SLIDE DEL CARRUSEL
  const WIDTH = 340;

  return (
    <div className="p-10">

      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Reseñas de fisioterapeutas
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Opiniones verificadas de pacientes
        </p>
        <div className="w-32 mx-auto mt-4 border-t-4 border-teal-500 rounded-full"></div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {datos.map((grupo) => (
          <div
            key={grupo.fisio._id}
            className="bg-white p-7 rounded-3xl shadow-lg border border-gray-100 
            hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* CABECERA */}
            <div className="flex items-center gap-5">
              <img
                src={fotoFisio[grupo.fisio.nombre]}
                alt={grupo.fisio.nombre}
                className="w-16 h-16 rounded-full object-cover border-2 border-teal-500 shadow-md"
              />

              <div>
                <h2 className="font-bold text-2xl text-gray-900">
                  {grupo.fisio.nombre} {grupo.fisio.apellidos}
                </h2>
                <p className="text-gray-500 text-sm">{grupo.fisio.especialidad}</p>

                <div className="flex items-center mt-2">
                  {renderStars(grupo.media)}
                  <span className="ml-2 text-gray-900 font-semibold text-lg">
                    {Number(grupo.media)?.toFixed(1)} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* SEPARADOR */}
            <hr className="my-6 border-gray-200" />

            {/* CARRUSEL DE RESEÑAS */}
            <div className="relative mt-6">

              {/* BOTÓN IZQUIERDA */}
              <button
                onClick={() => {
                  const ref = document.getElementById(`carousel-${grupo.fisio._id}`);
                  ref.scrollBy({ left: -WIDTH, behavior: "smooth" });

                  setPaginaCarrusel((prev) => ({
                    ...prev,
                    [grupo.fisio._id]: Math.max((prev[grupo.fisio._id] || 0) - 1, 0),
                  }));
                }}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-teal-600 text-white 
                shadow-lg rounded-full w-10 h-10 flex items-center justify-center 
                hover:scale-110 transition-all z-10"
              >
                ←
              </button>

              {/* CARRUSEL */}
              <div
                id={`carousel-${grupo.fisio._id}`}
                className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory 
                scrollbar-hide px-2 py-1"
              >
                {grupo.reseñas.map((r, i) => (
                  <div
                    key={i}
                    className="min-w-[320px] max-w-[320px] bg-gray-50 p-5 rounded-xl 
                    border border-gray-200 snap-center shrink-0 shadow-sm 
                    hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center">
                      {renderStars(r.puntuacion)}
                      <span className="ml-2 text-gray-700 font-semibold">
                        {r.puntuacion} / 5
                      </span>
                    </div>

                    <p className="mt-3 text-gray-900 leading-relaxed">
                      “{r.comentario}”
                    </p>

                    <p className="mt-3 text-sm text-gray-600">
                      Paciente:{" "}
                      <span className="font-bold">
                        {r.paciente?.nombre} {r.paciente?.apellidos}
                      </span>
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(r.fecha).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* BOTÓN DERECHA */}
              <button
                onClick={() => {
                  const ref = document.getElementById(`carousel-${grupo.fisio._id}`);
                  ref.scrollBy({ left: WIDTH, behavior: "smooth" });

                  setPaginaCarrusel((prev) => ({
                    ...prev,
                    [grupo.fisio._id]: Math.min(
                      (prev[grupo.fisio._id] || 0) + 1,
                      grupo.reseñas.length - 1
                    ),
                  }));
                }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-teal-600 text-white 
                shadow-lg rounded-full w-10 h-10 flex items-center justify-center 
                hover:scale-110 transition-all z-10"
              >
                →
              </button>

              {/* PUNTOS DE PAGINACIÓN */}
              <div className="flex justify-center mt-4 gap-2">
                {grupo.reseñas.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const ref = document.getElementById(`carousel-${grupo.fisio._id}`);
                      ref.scrollTo({ left: index * WIDTH, behavior: "smooth" });

                      setPaginaCarrusel((prev) => ({
                        ...prev,
                        [grupo.fisio._id]: index,
                      }));
                    }}
                    className={`
                      w-3 h-3 rounded-full cursor-pointer transition-all 
                      ${
                        paginaCarrusel[grupo.fisio._id] === index
                          ? "bg-teal-600 scale-110"
                          : "bg-gray-300 hover:bg-gray-400"
                      }
                    `}
                  />
                ))}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
