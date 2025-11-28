// server/routes/valoraciones.js
const express = require('express');
const router = express.Router();
const Valoracion = require('../models/valoraciones');
// Asegúrate de que el nombre del fichero sea correcto (mayúsculas/minúsculas)
const Cita = require('../models/cita'); 
const User = require('../models/user');
const auth = require('../middleware/auth');

// =====================================================================
// RUTA: POST /api/valoraciones/crear
// =====================================================================
router.post('/crear', auth, async (req, res) => {
  try {
    const { fisioId, puntuacion, comentario, especialidad } = req.body;

    // 1. Validaciones básicas
    if (!fisioId || !puntuacion || !especialidad) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios: fisioId, puntuacion, especialidad' });
    }

    // 2. Verificar rol del usuario
    if (req.userRole !== 'cliente' && req.userRole !== 'paciente') { 
      // Nota: Acepto 'cliente' o 'paciente' por si acaso usas distintos nombres de rol
      return res.status(403).json({ msg: 'Solo los pacientes pueden dejar valoraciones' });
    }

    // 3. Comprobar que fisio existe
    const fisio = await User.findById(fisioId).lean();
    if (!fisio) return res.status(404).json({ msg: 'Fisioterapeuta no encontrado' });

    // 4. Comprobar CITA COMPLETADA
    // ATENCIÓN: Aquí verificamos si en tu modelo de Cita el campo se llama 'fisio' o 'fisioterapeuta'.
    // Usaremos un $or para que funcione con ambos casos, o revísalo en tu modelo server/models/cita.js
    const tuvoCita = await Cita.findOne({
      paciente: req.userId,
      $or: [{ fisio: fisioId }, { fisioterapeuta: fisioId }], 
      estado: 'completada'
    }).lean();

    if (!tuvoCita) {
      return res.status(403).json({ 
        msg: 'No puedes valorar: No se encontró una cita "completada" con este fisioterapeuta.' 
      });
    }

    // 5. Verificar si ya existe una valoración para esta cita/fisio (Opcional, para evitar duplicados)
    const existeValoracion = await Valoracion.findOne({ paciente: req.userId, fisio: fisioId });
    if (existeValoracion) {
        return res.status(400).json({ msg: 'Ya has valorado a este fisioterapeuta anteriormente.' });
    }

    // 6. Crear la valoración
    const nueva = new Valoracion({
      fisio: fisioId,
      paciente: req.userId,
      puntuacion: Number(puntuacion),
      comentario: comentario || '',
      especialidad
    });

    await nueva.save();
    
    return res.status(201).json({ msg: 'Valoración creada exitosamente', valoracion: nueva });

  } catch (err) {
    console.error('Error creando valoración:', err);
    return res.status(500).json({ msg: 'Error interno del servidor al crear valoración' });
  }
});



// Listar valoraciones de un fisioterapeuta
router.get('/fisio/:id', async (req, res) => {
  try {
    const valoraciones = await Valoracion.find({ fisio: req.params.id })
      .populate('paciente', 'nombre apellidos') 
      .sort({ fecha: -1 });
    return res.json({ valoraciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error obteniendo valoraciones' });
  }
});

router.get('/especialidad/:esp', async (req, res) => {
  try {
    const valoraciones = await Valoracion.find({ especialidad: req.params.esp })
      .populate('fisio', 'nombre apellidos')
      .sort({ fecha: -1 });
    return res.json({ valoraciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error obteniendo valoraciones por especialidad' });
  }
});

router.get('/mis-valoraciones', auth, async (req, res) => {
  try {
    if (req.userRole !== 'fisioterapeuta') return res.status(403).json({ msg: 'No autorizado' });
    const valoraciones = await Valoracion.find({ fisio: req.userId })
      .populate('paciente', 'nombre apellidos')
      .sort({ fecha: -1 });
    return res.json({ valoraciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error obteniendo mis valoraciones' });
  }
});

module.exports = router;