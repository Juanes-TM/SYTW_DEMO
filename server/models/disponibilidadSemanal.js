// server/models/disponibilidadSemanal.js
const mongoose = require("mongoose");

const DiaSchema = new mongoose.Schema({
  nombre: { type: String, required: true }, // "lunes", "martes", etc.
  horas: [
    {
      inicio: { type: String, required: true }, // HH:mm
      fin: { type: String, required: true }     // HH:mm
    }
  ]
});

const DisponibilidadSemanalSchema = new mongoose.Schema({
  fisio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  dias: [DiaSchema]
});

module.exports = mongoose.model("DisponibilidadSemanal", DisponibilidadSemanalSchema);
