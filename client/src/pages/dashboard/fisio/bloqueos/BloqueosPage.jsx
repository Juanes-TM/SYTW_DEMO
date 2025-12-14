import { useState, useEffect } from "react";
import api from "../../../../services/api"; 
import { Trash2, Plus, CalendarOff, AlertCircle } from "lucide-react";

export default function BloqueosPage() {
  const [bloqueos, setBloqueos] = useState([]);
  const [fecha, setFecha] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarBloqueos();
  }, []);

  const cargarBloqueos = async () => {
    try {
      const res = await api.get("/api/bloqueos");
      setBloqueos(res.data);
    } catch (err) {
      console.error("Error cargando bloqueos:", err);
    }
  };

  const handleBloquear = async (e) => {
    e.preventDefault();
    if (!fecha) return;
    
    setError("");
    setLoading(true);

    try {
      // Enviamos la fecha y el motivo al backend
      await api.post("/api/bloqueos", { 
        fecha, 
        motivo: motivo || "No disponible" 
      });
      
      // Limpiamos y recargamos
      setFecha("");
      setMotivo("");
      cargarBloqueos();
    } catch (err) {
      setError(err.response?.data?.msg || "Error al bloquear el día.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Quieres desbloquear este día y volver a estar disponible?")) return;
    
    try {
      await api.delete(`/api/bloqueos/${id}`);
      cargarBloqueos();
    } catch (err) {
      alert("Error al eliminar el bloqueo.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      
      {/* CABECERA */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-red-100 p-3 rounded-2xl text-red-600">
          <CalendarOff size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Ausencias</h1>
          <p className="text-gray-500">Bloquea días completos para vacaciones o asuntos personales.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE BLOQUEO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Bloquear Nuevo Día</h3>
          
          <form onSubmit={handleBloquear} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Fecha</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} // No permitir pasado
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej: Vacaciones, Médico..." 
                value={motivo} 
                onChange={(e) => setMotivo(e.target.value)} 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button 
              disabled={loading} 
              className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-bold flex justify-center items-center gap-2 transition shadow-sm"
            >
              {loading ? "Procesando..." : <><Plus size={18} /> Bloquear Fecha</>}
            </button>
          </form>
        </div>

        {/* LISTA DE DÍAS BLOQUEADOS */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center justify-between">
            <span>Días No Disponibles</span>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{bloqueos.length}</span>
          </h3>
          
          {bloqueos.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
              <CalendarOff size={40} className="mx-auto mb-2 opacity-50" />
              <p>No tienes días bloqueados actualmente.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {bloqueos.map((b) => (
                <div key={b._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-red-200 transition">
                  
                  <div className="flex items-center gap-4">
                    {/* Caja de fecha */}
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-center min-w-[70px]">
                      <span className="block text-xl font-bold">{new Date(b.startAt).getDate()}</span>
                      <span className="text-xs uppercase font-bold tracking-wider">
                        {new Date(b.startAt).toLocaleDateString('es-ES', { month: 'short' })}
                      </span>
                    </div>
                    
                    {/* Detalles */}
                    <div>
                      <p className="font-semibold text-gray-800 capitalize">
                        {new Date(b.startAt).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {b.motivo}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleEliminar(b._id)} 
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar bloqueo"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}