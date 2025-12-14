const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false }, 
  tipo: { type: String, default: 'recordatorio' }, 
  fecha: { type: Date, default: Date.now },
  citaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita' } 
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);