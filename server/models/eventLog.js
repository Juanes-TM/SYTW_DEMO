// server/models/EventLog.js
const { Schema, model } = require("mongoose");

const eventLogSchema = new Schema(
  {
    tipo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = model("EventLog", eventLogSchema);
