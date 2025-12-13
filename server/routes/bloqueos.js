const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bloqueo = require('../models/bloqueo');

// GET /api/bloqueos - Listar mis bloqueos (Fisio)
router.get('/', auth, async (req, res) => {
  try {
    // Si es fisio, ve los suyos. Si es admin, podría ver todos (opcional)
    const bloqueos = await Bloqueo.find({ fisioterapeuta: req.userId }).sort({ startAt: 1 });
    res.json(bloqueos);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener bloqueos' });
  }
});

// POST /api/bloqueos - Crear un bloqueo (Día completo)
router.post('/', auth, async (req, res) => {
  try {
    const { fecha, motivo } = req.body; // fecha en formato 'YYYY-MM-DD'

    if (!fecha) return res.status(400).json({ msg: 'Fecha obligatoria' });

    // Definir inicio y fin del día
    const startAt = new Date(fecha);
    startAt.setHours(0, 0, 0, 0);
    
    const endAt = new Date(fecha);
    endAt.setHours(23, 59, 59, 999);

    // Verificar si ya existe bloqueo ese día
    const existe = await Bloqueo.findOne({
      fisioterapeuta: req.userId,
      startAt: { $lte: endAt },
      endAt: { $gte: startAt }
    });

    if (existe) {
      return res.status(400).json({ msg: 'Ya tienes un bloqueo para esta fecha.' });
    }

    const nuevoBloqueo = new Bloqueo({
      fisioterapeuta: req.userId,
      startAt,
      endAt,
      motivo,
      tipo: 'dia_completo'
    });

    await nuevoBloqueo.save();
    res.status(201).json({ msg: 'Día bloqueado correctamente', bloqueo: nuevoBloqueo });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear bloqueo' });
  }
});

// DELETE /api/bloqueos/:id - Eliminar bloqueo
router.delete('/:id', auth, async (req, res) => {
  try {
    const bloqueo = await Bloqueo.findById(req.params.id);
    
    if (!bloqueo) return res.status(404).json({ msg: 'Bloqueo no encontrado' });

    // Verificar que pertenece al usuario
    if (bloqueo.fisioterapeuta.toString() !== req.userId) {
      return res.status(403).json({ msg: 'No autorizado' });
    }

    await Bloqueo.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Bloqueo eliminado' });

  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar' });
  }
});

module.exports = router;