// server/models/disponibilidadSemanal.js
const mongoose = require("mongoose");

const DiaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  horas: [
    {
      inicio: { type: String, required: true },
      fin: { type: String, required: true }
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
