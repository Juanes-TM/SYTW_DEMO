console.log("🔥 CRON SERVICE CARGADO ✔");

const cron = require("node-cron");
const Cita = require("../models/cita");
const Notificacion = require("../models/notificacion");

const iniciarCron = () => {
  console.log("🚀 iniciarCron() EJECUTADO ✔");

  // ============================
  // 🔔 RECORDATORIO 24H ANTES
  // ============================
  cron.schedule("0 * * * *", async () => {
    try {
      const ahora = new Date();
      const mananaInicio = new Date(ahora.getTime() + 23 * 60 * 60 * 1000);
      const mananaFin = new Date(ahora.getTime() + 25 * 60 * 60 * 1000);

      const citasProximas = await Cita.find({
        startAt: { $gte: mananaInicio, $lt: mananaFin },
        estado: { $in: ["pendiente", "confirmada"] },
        recordatorioEnviado: { $ne: true },
      }).populate("paciente");

      for (const cita of citasProximas) {
        await Notificacion.create({
          usuario: cita.paciente._id,
          mensaje: `🕑 Recordatorio: Tienes una cita mañana a las ${new Date(
            cita.startAt
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          tipo: "recordatorio",
          citaId: cita._id,
        });

        cita.recordatorioEnviado = true;
        await cita.save();
      }

      if (citasProximas.length > 0)
        console.log(`🔔 Recordatorios enviados: ${citasProximas.length}`);
    } catch (error) {
      console.error("Error en cron de recordatorios:", error);
    }
  });

  // ===============================
  // CRON: MARCAR CITAS PASADAS COMO COMPLETADAS
  // ===============================
  cron.schedule("*/10 * * * * *", async () => {
    try {
      const ahora = new Date();
      console.log("⏳ [CRON COMPLETAR] Ejecutado. Hora actual:", ahora.toISOString());

      const citasParaCompletar = await Cita.find({
        endAt: { $lt: ahora },
        estado: { $in: ["pendiente", "confirmada"] },
      });

      console.log("🔎 [CRON COMPLETAR] Citas detectadas:", citasParaCompletar.length);

      if (citasParaCompletar.length > 0) {
        console.log(
          `✔ Marcando ${citasParaCompletar.length} citas como completadas...`
        );
      }

      for (const cita of citasParaCompletar) {
        cita.estado = "completada";
        await cita.save();
      }
    } catch (error) {
      console.error("❌ Error en cron de completar citas:", error);
    }
  });
};

module.exports = iniciarCron;
