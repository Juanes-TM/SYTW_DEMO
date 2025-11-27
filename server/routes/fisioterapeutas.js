// server/routes/fisioterapeutas.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// cualquier usuario logueado puede ver fisioterapeutas
router.get("/", auth, async (req, res) => {
  try {
    const fisios = await User.find({ rol: "fisioterapeuta" })
      .select("_id nombre apellido email especialidad");

    res.json(fisios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener fisioterapeutas" });
  }
});

module.exports = router;