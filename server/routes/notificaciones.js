const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notificacion = require('../models/notificacion');

// GET: Obtener mis notificaciones no leídas (o todas)
router.get('/', auth, async (req, res) => {
  try {
    const notificaciones = await Notificacion.find({ usuario: req.userId })
      .sort({ fecha: -1 }) // Las más nuevas primero
      .limit(10); // Traemos las últimas 10
    
    res.json(notificaciones);
  } catch (err) {
    res.status(500).json({ msg: 'Error obteniendo notificaciones' });
  }
});

// PUT: Marcar una como leída
router.put('/:id/leer', auth, async (req, res) => {
  try {
    await Notificacion.findByIdAndUpdate(req.params.id, { leida: true });
    res.json({ msg: 'Leída' });
  } catch (err) {
    res.status(500).json({ msg: 'Error actualizando' });
  }
});

// PUT: Marcar TODAS como leídas
router.put('/leer-todas', auth, async (req, res) => {
  try {
    await Notificacion.updateMany({ usuario: req.userId, leida: false }, { leida: true });
    res.json({ msg: 'Todas leídas' });
  } catch (err) {
    res.status(500).json({ msg: 'Error actualizando' });
  }
});

module.exports = router;