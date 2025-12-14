// server/models/disponibilidadDia.js
const mongoose = require("mongoose");

const DisponibilidadDiaSchema = new mongoose.Schema({
  fisio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fecha: { type: Date, required: true },

  cerrado: { type: Boolean, default: false },

  horas: [
    {
      inicio: { type: String, required: true }, // HH:mm
      fin: { type: String, required: true }
    }
  ]
});

DisponibilidadDiaSchema.index({ fisio: 1, fecha: 1 }, { unique: true });

module.exports = mongoose.model("DisponibilidadDia", DisponibilidadDiaSchema);
