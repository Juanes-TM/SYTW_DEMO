// client/src/components/dashboard/paciente/citas/reserva/BuscadorFisios.jsx

import { Search, Star, User } from "lucide-react";

export default function BuscadorFisios({ 
  fisios, 
  fisioSeleccionadoId, 
  onSelectFisio, 
  filtros, 
  setFiltros 
}) {
  
  // Lista de especialidades disponibles
  const ESPECIALIDADES = [
     "Traumatología", "Deportiva", "Neurología", 
     "Respiratoria", "General", "Pediátrica", "Acupuntura"
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* BARRA DE BÚSQUEDA */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            value={filtros.texto}
            onChange={(e) => setFiltros({ ...filtros, texto: e.target.value })}
          />
        </div>

        {/* FILTRO ESPECIALIDAD */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
          value={filtros.especialidad}
          onChange={(e) => setFiltros({ ...filtros, especialidad: e.target.value })}
        >
          <option value="">Todas las especialidades</option>
          {ESPECIALIDADES.map(esp => (
            <option key={esp} value={esp}>{esp}</option>
          ))}
        </select>

        {/* FILTRO RATING (ACTUALIZADO CON EMOJIS) */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
          value={filtros.minRating}
          onChange={(e) => setFiltros({ ...filtros, minRating: Number(e.target.value) })}
        >
          <option value="0">Cualquier valoración</option>
          <option value="3">⭐⭐⭐ (3+)</option>
          <option value="4">⭐⭐⭐⭐ (4+)</option>
          <option value="5">⭐⭐⭐⭐⭐ (5)</option>
        </select>
      </div>

      {/* LISTA DE RESULTADOS (GRID VISUAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
        {fisios.length > 0 ? (
          fisios.map((f) => {
            const isSelected = f._id === fisioSeleccionadoId;
            return (
              <div
                key={f._id}
                onClick={() => onSelectFisio(f._id)}
                className={`
                  cursor-pointer p-3 rounded-lg border transition-all flex items-start gap-3
                  ${isSelected 
                    ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500" 
                    : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"}
                `}
              >
                {/* Avatar Genérico */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-teal-200 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
                   <User size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${isSelected ? "text-teal-800" : "text-gray-700"}`}>
                    {f.nombre} {f.apellido}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {f.especialidad || "General"}
                  </p>
                  
                  {/* Estrellas (Aquí sí usamos SVG para mayor precisión visual) */}
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-gray-600">
                      {f.rating > 0 ? f.rating : "N/A"} 
                      {f.totalValoraciones ? ` (${f.totalValoraciones})` : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500 text-sm">
            No se encontraron fisioterapeutas.
          </div>
        )}
      </div>
    </div>
  );
}