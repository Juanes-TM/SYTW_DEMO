const mongoose = require('mongoose');

const BloqueoSchema = new mongoose.Schema({
  fisioterapeuta: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  startAt: { type: Date, required: true }, // Fecha inicio del bloqueo
  endAt: { type: Date, required: true },   // Fecha fin del bloqueo
  motivo: { type: String, default: 'No disponible' },
  tipo: { 
    type: String, 
    enum: ['dia_completo', 'intervalo'], 
    default: 'dia_completo' 
  }
});

// Índice para búsquedas rápidas por fisio y fecha
BloqueoSchema.index({ fisioterapeuta: 1, startAt: 1, endAt: 1 });

module.exports = mongoose.model('Bloqueo', BloqueoSchema);