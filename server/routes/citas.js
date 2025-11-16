const express = require("express");
const router = express.Router();
const Cita = require("../models/cita");
const User = require("../models/user");
const auth = require("../middleware/auth");

// ---------------------------------------------
// Helper → comprobar solapamientos del fisio
// ---------------------------------------------
async function haySolapamiento(fisioId, startAt, endAt) {
  return await Cita.findOne({
    fisioterapeuta: fisioId,
    estado: { $ne: "cancelada" },
    $or: [
      { startAt: { $lt: endAt }, endAt: { $gt: startAt } } // overlap condition
    ]
  }).lean();
}

// ---------------------------------------------
// Crear nueva cita
// ---------------------------------------------
router.post("/", auth, async (req, res) => {
  const { fisioterapeutaId, startAt, durationMinutes, motivo, observaciones } = req.body;

  if (!fisioterapeutaId || !startAt || !durationMinutes || !motivo) {
    return res.status(400).json({ msg: "Faltan campos obligatorios" });
  }

  const start = new Date(startAt);
  if (isNaN(start.getTime())) {
    return res.status(400).json({ msg: "Fecha no válida" });
  }

  const duration = Number(durationMinutes);
  if (!Number.isFinite(duration) || duration <= 0) {
    return res.status(400).json({ msg: "Duración no válida" });
  }

  const end = new Date(start.getTime() + duration * 60 * 1000);

  try {
    // validar fisio
    const fisio = await User.findById(fisioterapeutaId).lean();
    if (!fisio) return res.status(404).json({ msg: "Fisioterapeuta no encontrado" });

    if (fisio.rol !== "fisioterapeuta" && req.userRole !== "admin") {
      return res.status(400).json({ msg: "El usuario no es un fisioterapeuta" });
    }

    // solapamiento
    const overlap = await haySolapamiento(fisioterapeutaId, start, end);
    if (overlap) {
      return res.status(409).json({ msg: "El fisioterapeuta tiene otra cita en ese horario" });
    }

    const nueva = new Cita({
      paciente: req.userId,
      fisioterapeuta: fisioterapeutaId,
      startAt: start,
      durationMinutes: duration,
      endAt: end,
      createdBy: { user: req.userId, role: req.userRole },
      motivo,
      observaciones: observaciones || "",
      estado: "pendiente"
    });

    await nueva.save();
    return res.status(201).json({ msg: "Cita creada", cita: nueva });

  } catch (err) {
    console.error("Error creando cita:", err);
    return res.status(500).json({ msg: "Error del servidor" });
  }
});

// ---------------------------------------------
// Obtener citas (según rol)
// ---------------------------------------------
router.get("/", auth, async (req, res) => {
  try {
    let filtro = {};

    if (req.userRole === "cliente") {
      filtro = { paciente: req.userId };
    } else if (req.userRole === "fisioterapeuta") {
      filtro = { fisioterapeuta: req.userId };
    }

    const citas = await Cita.find(filtro)
      .populate("paciente", "nombre apellido email")
      .populate("fisioterapeuta", "nombre apellido email")
      .sort({ startAt: 1 });

    res.status(200).json(citas);
  } catch (err) {
    console.error("Error listando citas:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

// ---------------------------------------------
// Editar motivo / observaciones
// ---------------------------------------------
router.patch("/:id", auth, async (req, res) => {
  const { motivo, observaciones } = req.body;

  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ msg: "Cita no encontrada" });

    // solo admin o creador puede editar el motivo
    if (motivo) {
      if (req.userRole !== "admin" && cita.createdBy.user.toString() !== req.userId) {
        return res.status(403).json({ msg: "No autorizado a cambiar el motivo" });
      }
      cita.motivo = motivo;
    }

    // observaciones → cualquiera puede añadir (paciente/fisio/admin)
    if (observaciones) {
      cita.observaciones = observaciones;
    }

    await cita.save();

    return res.status(200).json({ msg: "Cita actualizada", cita });
  } catch (err) {
    console.error("Error actualizando cita:", err);
    return res.status(500).json({ msg: "Error del servidor" });
  }
});

// ---------------------------------------------
// Cambiar estado de la cita
// ---------------------------------------------
router.put("/:id/estado", auth, async (req, res) => {
  const { estado } = req.body;

  const permitidos = ["pendiente", "confirmada", "cancelada", "completada"];
  if (!permitidos.includes(estado)) {
    return res.status(400).json({ msg: "Estado no válido" });
  }

  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ msg: "Cita no encontrada" });

    // Permisos
    // Paciente: solo cancelar sus propias citas
    if (req.userRole === "cliente") {
      if (estado !== "cancelada") {
        return res.status(403).json({ msg: "No autorizado a cambiar a ese estado" });
      }
      if (cita.paciente.toString() !== req.userId) {
        return res.status(403).json({ msg: "Solo puedes cancelar tus propias citas" });
      }
    }

    // Fisio: solo gestionar sus citas
    if (req.userRole === "fisioterapeuta") {
      if (cita.fisioterapeuta.toString() !== req.userId) {
        return res.status(403).json({ msg: "No puedes modificar citas de otros fisioterapeutas" });
      }
    }

    // Admin: todo permitido

    cita.estado = estado;
    await cita.save();

    res.status(200).json({ msg: "Estado actualizado", cita });

  } catch (err) {
    console.error("Error cambiando estado:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
