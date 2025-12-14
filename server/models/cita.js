const mongoose = require('mongoose');

const CitaSchema = new mongoose.Schema({
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fisioterapeuta: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Inicio de la cita (fecha + hora)
  startAt: { type: Date, required: true },

  // Duración en minutos y fin calculado
  durationMinutes: { type: Number, required: true, min: 30 },
  endAt: { type: Date, required: true },

  // Quién creó la cita (puede ser paciente o admin)
  createdBy: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['cliente','admin'], required: true }
  },

  motivo: { type: String, required: true },
  observaciones: { type: String, default: '' },

  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente'
  }
});

// Índice para buscar solapamientos por fisioterapeuta rápidamente
CitaSchema.index({ fisioterapeuta: 1, startAt: 1, endAt: 1 });

module.exports = mongoose.model('Cita', CitaSchema);
