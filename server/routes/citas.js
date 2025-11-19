const express = require("express");
const router = express.Router();
const Cita = require("../models/cita");
const User = require("../models/user");
const auth = require("../middleware/auth");

// ------------------------------
// SOLAPAMIENTO
// ------------------------------
async function haySolapamiento(fisioId, startAt, endAt) {
  return await Cita.findOne({
    fisioterapeuta: fisioId,
    estado: { $ne: "cancelada" },
    $or: [
      { startAt: { $lt: endAt }, endAt: { $gt: startAt } }
    ]
  }).lean();
}

// ------------------------------
// CREAR NUEVA CITA
// ------------------------------
router.post("/", auth, async (req, res) => {
  try {
    let {
      fisioterapeutaId,
      startAt,
      endAt,
      durationMinutes,
      motivo,
      observaciones
    } = req.body;

    // Validaciones mínimas
    if (!fisioterapeutaId || !startAt || !motivo) {
      return res.status(400).json({ msg: "Faltan campos obligatorios" });
    }

    const start = new Date(startAt);
    if (isNaN(start)) {
      return res.status(400).json({ msg: "Fecha no válida" });
    }

    // Si viene endAt → calcular duración
    let end;
    if (endAt) {
      end = new Date(endAt);
      if (isNaN(end)) {
        return res.status(400).json({ msg: "endAt no es válido" });
      }
      durationMinutes = Math.floor((end - start) / (60 * 1000));
    }

    // Si NO viene endAt pero sí durationMinutes → calcular end
    else if (durationMinutes) {
      const dur = Number(durationMinutes);
      if (!Number.isFinite(dur) || dur <= 0) {
        return res.status(400).json({ msg: "Duración no válida" });
      }
      end = new Date(start.getTime() + dur * 60000);
    }

    // Si no hay duración por ninguna vía
    else {
      return res.status(400).json({
        msg: "Debes enviar endAt o durationMinutes"
      });
    }

    // Validar fisio
    const fisio = await User.findById(fisioterapeutaId).lean();
    if (!fisio) {
      return res.status(404).json({ msg: "Fisioterapeuta no encontrado" });
    }

    if (fisio.rol !== "fisioterapeuta" && req.userRole !== "admin") {
      return res.status(400).json({ msg: "El usuario no es un fisioterapeuta" });
    }

    // Comprobar solapamiento real
    const overlap = await haySolapamiento(fisioterapeutaId, start, end);
    if (overlap) {
      return res.status(409).json({
        msg: "El fisioterapeuta tiene otra cita en ese horario"
      });
    }

    // Crear cita
    const nueva = new Cita({
      paciente: req.userId,
      fisioterapeuta: fisioterapeutaId,
      startAt: start,
      endAt: end,
      durationMinutes,
      motivo,
      observaciones: observaciones || "",
      estado: "pendiente",
      createdBy: { user: req.userId, role: req.userRole }
    });

    await nueva.save();

    res.status(201).json({
      msg: "Cita creada correctamente",
      cita: nueva
    });

  } catch (err) {
    console.error("Error creando cita:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

// ------------------------------
// LISTAR CITAS SEGÚN ROL
// ------------------------------
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

// ------------------------------
// EDITAR MOTIVO / OBSERVACIONES
// ------------------------------
router.patch("/:id", auth, async (req, res) => {
  const { motivo, observaciones } = req.body;

  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ msg: "Cita no encontrada" });

    // Motivo: solo admin o creador
    if (motivo) {
      if (req.userRole !== "admin" && cita.createdBy.user.toString() !== req.userId) {
        return res.status(403).json({ msg: "No autorizado" });
      }
      cita.motivo = motivo;
    }

    if (observaciones) {
      cita.observaciones = observaciones;
    }

    await cita.save();
    res.status(200).json({ msg: "Cita actualizada", cita });

  } catch (err) {
    console.error("Error actualizando cita:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

// ------------------------------
// CAMBIAR ESTADO
// ------------------------------
router.put("/:id/estado", auth, async (req, res) => {
  const { estado } = req.body;

  const permitidos = ["pendiente", "confirmada", "cancelada", "completada"];
  if (!permitidos.includes(estado)) {
    return res.status(400).json({ msg: "Estado no válido" });
  }

  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ msg: "Cita no encontrada" });

    // Permisos según rol
    if (req.userRole === "cliente") {
      if (estado !== "cancelada" || cita.paciente.toString() !== req.userId) {
        return res.status(403).json({ msg: "No autorizado" });
      }
    }

    if (req.userRole === "fisioterapeuta") {
      if (cita.fisioterapeuta.toString() !== req.userId) {
        return res.status(403).json({ msg: "No autorizado" });
      }
    }

    cita.estado = estado;
    await cita.save();

    res.status(200).json({ msg: "Estado actualizado", cita });

  } catch (err) {
    console.error("Error cambiando estado:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
