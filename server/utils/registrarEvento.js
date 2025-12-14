const EventLog = require("../models/eventLog");

async function registrarEvento(tipo, descripcion) {
  try {
    await EventLog.create({ tipo, descripcion });
  } catch (err) {
    console.error("Error registrando evento:", err);
  }
}

module.exports = registrarEvento;
