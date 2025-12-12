// server/models/valoraciones.js

const mongoose = require('mongoose');

const ValoracionSchema = new mongoose.Schema({
  fisio: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  puntuacion: { type: Number, min: 1, max: 5, required: true },
  comentario: { type: String, maxlength: 500, default: '' },
  especialidad: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});

// indice para buscar por fisio + especialidad rapidamente
ValoracionSchema.index({ fisio: 1, especialidad: 1, fecha: -1 });

module.exports = mongoose.model('Valoraciones', ValoracionSchema);
