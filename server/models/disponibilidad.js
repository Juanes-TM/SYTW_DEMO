// server/routes/disponibilidad.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const DisponibilidadSemanal = require("../models/disponibilidadSemanal");
const DisponibilidadDia = require("../models/disponibilidadDia");
const Cita = require("../models/cita");
const User = require("../models/user");

// Helpers
const diasSemana = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado"
];

function normalizarFecha(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getNombreDia(fecha) {
  const d = new Date(fecha);
  return diasSemana[d.getDay()];
}

function parseHoraToMinutes(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHora(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function validarIntervalos(horas) {
  if (!Array.isArray(horas)) return false;
  for (const h of horas) {
    if (!h.inicio || !h.fin) return false;
    const ini = parseHoraToMinutes(h.inicio);
    const fin = parseHoraToMinutes(h.fin);
    if (isNaN(ini) || isNaN(fin) || ini >= fin) return false;
  }
  return true;
}

// Middleware: solo fisioterapeuta o admin
async function soloFisioOAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(401).json({ msg: "Usuario no encontrado" });

    if (user.rol !== "fisioterapeuta" && user.rol !== "admin") {
      return res.status(403).json({ msg: "Solo fisioterapeutas o administradores pueden modificar disponibilidad" });
    }

    next();
  } catch (err) {
    console.error("Error en soloFisioOAdmin:", err);
    res.status(500).json({ msg: "Error en el servidor" });
  }
}

// GET /api/disponibilidad/semana/:fisioId
router.get("/semana/:fisioId", auth, async (req, res) => {
  try {
    const { fisioId } = req.params;

    const doc = await DisponibilidadSemanal.findOne({ fisio: fisioId }).lean();

    const baseDias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo"
    ].map((nombre) => ({
      nombre,
      horas: []
    }));

    if (!doc) {
      return res.status(200).json({
        fisio: fisioId,
        dias: baseDias
      });
    }

    const mapa = Object.fromEntries(doc.dias.map((d) => [d.nombre, d.horas]));
    const diasCompletos = baseDias.map((d) => ({
      nombre: d.nombre,
      horas: mapa[d.nombre] || []
    }));

    return res.status(200).json({
      fisio: doc.fisio,
      dias: diasCompletos
    });
  } catch (err) {
    console.error("Error en GET /semana:", err);
    res.status(500).json({ msg: "Error al obtener disponibilidad semanal" });
  }
});

// PUT /api/disponibilidad/semana
router.put("/semana", auth, soloFisioOAdmin, async (req, res) => {
  try {
    const userId = req.userId;
    const { dias } = req.body;

    if (!dias || typeof dias !== "object") {
      return res.status(400).json({ msg: "Estructura de dias no válida" });
    }

    const diasArray = [];
    for (const nombre of [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo"
    ]) {
      const horas = dias[nombre] || [];
      if (!validarIntervalos(horas)) {
        return res.status(400).json({
          msg: `Intervalos inválidos para el día ${nombre}`
        });
      }
      diasArray.push({ nombre, horas });
    }

    const updated = await DisponibilidadSemanal.findOneAndUpdate(
      { fisio: userId },
      { fisio: userId, dias: diasArray },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      msg: "Disponibilidad semanal actualizada",
      disponibilidad: updated
    });
  } catch (err) {
    console.error("Error en PUT /semana:", err);
    res.status(500).json({ msg: "Error al actualizar disponibilidad semanal" });
  }
});

// GET /api/disponibilidad/dia?fisioId=...&fecha=YYYY-MM-DD
router.get("/dia", auth, async (req, res) => {
  try {
    const { fisioId, fecha } = req.query;
    if (!fisioId || !fecha) {
      return res.status(400).json({ msg: "fisioId y fecha son obligatorios" });
    }

    const fechaObj = normalizarFecha(fecha);
    const nombreDia = getNombreDia(fechaObj);

    const excepcion = await DisponibilidadDia.findOne({
      fisio: fisioId,
      fecha: fechaObj
    }).lean();

    if (excepcion) {
      if (excepcion.cerrado) {
        return res.status(200).json({
          fisio: fisioId,
          fecha: fechaObj,
          cerrado: true,
          horas: []
        });
      }
      return res.status(200).json({
        fisio: fisioId,
        fecha: fechaObj,
        cerrado: false,
        horas: excepcion.horas || []
      });
    }

    const semanal = await DisponibilidadSemanal.findOne({
      fisio: fisioId
    }).lean();

    const horasBase =
      semanal?.dias.find((d) => d.nombre === nombreDia)?.horas || [];

    return res.status(200).json({
      fisio: fisioId,
      fecha: fechaObj,
      cerrado: horasBase.length === 0,
      horas: horasBase
    });
  } catch (err) {
    console.error("Error en GET /dia:", err);
    res.status(500).json({ msg: "Error al obtener disponibilidad del día" });
  }
});

// POST /api/disponibilidad/dia
router.post("/dia", auth, soloFisioOAdmin, async (req, res) => {
  try {
    const userId = req.userId;
    const { fecha, cerrado, horas } = req.body;

    if (!fecha) {
      return res.status(400).json({ msg: "La fecha es obligatoria" });
    }

    const fechaNorm = normalizarFecha(fecha);

    if (cerrado === true) {
      const doc = await DisponibilidadDia.findOneAndUpdate(
        { fisio: userId, fecha: fechaNorm },
        { fisio: userId, fecha: fechaNorm, cerrado: true, horas: [] },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.status(200).json({
        msg: "Día marcado como cerrado",
        disponibilidadDia: doc
      });
    }

    if (!validarIntervalos(horas)) {
      return res.status(400).json({ msg: "Intervalos horarios no válidos" });
    }

    const doc = await DisponibilidadDia.findOneAndUpdate(
      { fisio: userId, fecha: fechaNorm },
      { fisio: userId, fecha: fechaNorm, cerrado: false, horas },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      msg: "Disponibilidad del día actualizada",
      disponibilidadDia: doc
    });
  } catch (err) {
    console.error("Error en POST /dia:", err);
    res.status(500).json({ msg: "Error al guardar disponibilidad del día" });
  }
});

// DELETE /api/disponibilidad/dia/:id
router.delete("/dia/:id", auth, soloFisioOAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await DisponibilidadDia.findByIdAndDelete(id);
    res.status(200).json({ msg: "Excepción eliminada" });
  } catch (err) {
    console.error("Error en DELETE /dia:", err);
    res.status(500).json({ msg: "Error al eliminar disponibilidad del día" });
  }
});

// GET /api/disponibilidad/intervalos?fisioId=...&fecha=YYYY-MM-DD&duracion=30
router.get("/intervalos", auth, async (req, res) => {
  try {
    const { fisioId, fecha, duracion } = req.query;

    if (!fisioId || !fecha || !duracion) {
      return res.status(400).json({
        msg: "fisioId, fecha y duracion son obligatorios"
      });
    }

    const durMin = Number(duracion);
    if (!Number.isFinite(durMin) || durMin <= 0) {
      return res.status(400).json({ msg: "Duración no válida" });
    }

    const fechaNorm = normalizarFecha(fecha);
    const fechaSiguiente = new Date(fechaNorm);
    fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);

    const respDia = await (async () => {
      const excepcion = await DisponibilidadDia.findOne({
        fisio: fisioId,
        fecha: fechaNorm
      }).lean();

      if (excepcion) {
        if (excepcion.cerrado) {
          return { horas: [], cerrado: true };
        }
        return { horas: excepcion.horas || [], cerrado: false };
      }

      const semanal = await DisponibilidadSemanal.findOne({
        fisio: fisioId
      }).lean();
      const nombreDia = getNombreDia(fechaNorm);
      const horasBase =
        semanal?.dias.find((d) => d.nombre === nombreDia)?.horas || [];
      return { horas: horasBase, cerrado: horasBase.length === 0 };
    })();

    if (respDia.cerrado || respDia.horas.length === 0) {
      return res.status(200).json({
        fisio: fisioId,
        fecha: fechaNorm,
        intervalosLibres: []
      });
    }

    const citas = await Cita.find({
      fisioterapeuta: fisioId,
      estado: { $ne: "cancelada" },
      startAt: { $gte: fechaNorm, $lt: fechaSiguiente }
    }).lean();

    const intervalosOcupados = citas.map((c) => ({
      ini: c.startAt.getTime(),
      fin: c.endAt.getTime()
    }));

    const intervalosLibres = [];

    for (const bloque of respDia.horas) {
      const bloqueInicioMin = parseHoraToMinutes(bloque.inicio);
      const bloqueFinMin = parseHoraToMinutes(bloque.fin);

      for (
        let t = bloqueInicioMin;
        t + durMin <= bloqueFinMin;
        t += durMin
      ) {
        const slotInicio = new Date(fechaNorm.getTime());
        slotInicio.setMinutes(slotInicio.getMinutes() + t);

        const slotFin = new Date(slotInicio.getTime() + durMin * 60000);

        const solapado = intervalosOcupados.some((c) => {
          return c.ini < slotFin.getTime() && c.fin > slotInicio.getTime();
        });

        if (!solapado) {
          intervalosLibres.push({
            inicio: minutesToHora(t),
            fin: minutesToHora(t + durMin),
            startAt: slotInicio,
            endAt: slotFin
          });
        }
      }
    }

    return res.status(200).json({
      fisio: fisioId,
      fecha: fechaNorm,
      intervalosLibres
    });
  } catch (err) {
    console.error("Error en GET /intervalos:", err);
    res.status(500).json({ msg: "Error al calcular intervalos libres" });
  }
});

module.exports = router;
