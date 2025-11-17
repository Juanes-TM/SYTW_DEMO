const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// Obtener perfil
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -__v");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener perfil" });
  }
});

// Actualizar perfil
router.put("/update", auth, async (req, res) => {
  try {
    const { nombre, apellido, telephone } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { nombre, apellido, telephone },
      { new: true }
    ).select("-password -__v");

    res.json({ user: updated });
  } catch (err) {
    console.error("Error update:", err);
    res.status(500).json({ msg: "Error actualizando perfil" });
  }
});

module.exports = router;
