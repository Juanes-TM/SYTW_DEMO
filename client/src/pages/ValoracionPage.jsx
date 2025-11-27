// client/src/pages/ValoracionForm.jsx
import { useState, useEffect } from 'react';
import { crearValoracion } from '../services/valoracionesService';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function ValoracionForm() {
  const [form, setForm] = useState({
    fisioId: '',
    puntuacion: 5,
    comentario: '',
    // ELIMINADO: especialidad
  });
  // ELIMINADO: estado de especialidades
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    // Si llamas con /valorar/:fisioId lo recogemos
    if (params.fisioId) setForm(f => ({ ...f, fisioId: params.fisioId }));
    
    // ELIMINADO: La lógica de useEffect para cargar especialidades (no es necesaria)
    
  }, [params.fisioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filtramos los datos a enviar para asegurar que solo van los campos correctos
    const dataToSend = {
        fisioId: form.fisioId,
        puntuacion: form.puntuacion,
        comentario: form.comentario,
        // La especialidad no se incluye
    };
    
    try {
      // Asumimos que 'crearValoracion' acepta el objeto limpio
      await crearValoracion(dataToSend); 
      alert('Valoración enviada. Gracias!');
      navigate(-1);
    } catch (err) {
      console.error('Error creando valoración:', err.response || err);
      setMsg(err.response?.data?.msg || 'Error enviando valoración');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Dejar valoración</h2>

      {msg && <p className="text-red-500 mb-3">{msg}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" value={form.fisioId} />

        <div>
          <label className="block text-sm">Puntuación (1-5)</label>
          <select
            value={form.puntuacion}
            onChange={e => setForm({ ...form, puntuacion: e.target.value })}
            className="p-2 border rounded"
          >
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
          </select>
        </div>

        {/* CAMPO ELIMINADO: Se quita todo el bloque JSX de Especialidad */}
        
        <div>
          <label className="block text-sm">Comentario (opcional)</label>
          <textarea
            value={form.comentario}
            onChange={e => setForm({ ...form, comentario: e.target.value })}
            className="w-full p-2 border rounded"
            rows={4}
            maxLength={500}
          />
        </div>

        <div className="flex gap-3">
          <button className="bg-teal-600 text-white px-4 py-2 rounded">Enviar</button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancelar</button>
        </div>
      </form>
    </div>
  );
}