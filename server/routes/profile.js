const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// Obtener perfil
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password -__v");
  res.json({ user });
});

// Actualizar perfil
router.put("/update", auth, async (req, res) => {
  const { nombre, apellido, telephone } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.userId,
    { nombre, apellido, telephone },
    { new: true }
  ).select("-password -__v");

  res.json({ user: updated });
});

module.exports = router;
