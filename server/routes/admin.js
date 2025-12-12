//server/routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const EventLog = require("../models/eventLog");
const registrarEvento = require("../utils/registrarEvento");

// Middleware para permitir solo admins
function isAdmin(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ msg: "Acceso denegado. Solo administradores." });
  }
  next();
}

// Listar todos los usuarios
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password -resetPasswordToken -resetPasswordExpires");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ msg: "Error al obtener usuarios", error: err.message });
  }
});

// Cambiar rol de un usuario
router.put("/users/:id/role", auth, isAdmin, async (req, res) => {
  const { rol } = req.body;
  if (!["cliente", "fisioterapeuta", "admin"].includes(rol)) {
    return res.status(400).json({ msg: "Rol no válido" });
  }

  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) return res.status(404).json({ msg: "Usuario no encontrado" });

    // Lógica para limpiar la especialidad si el rol cambia de fisio a otro
    const updateData = { rol };
    if (userToUpdate.rol === 'fisioterapeuta' && rol !== 'fisioterapeuta') {
        updateData.especialidad = null; // Elimina la especialidad al dejar de ser fisio
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    const adminUser = await User.findById(req.userId).select("nombre apellido email");

    await registrarEvento(
      "cambio_rol",
      `El administrador ${adminUser.nombre} ${adminUser.apellido} (${adminUser.email}) cambió el rol de ${user.email} a ${rol}`
    );

    res.status(200).json({ msg: "Rol actualizado correctamente", user });
  } catch (err) {
    console.error("Error al cambiar rol:", err);
    res.status(500).json({ msg: "Error al cambiar el rol", error: err.message });
  }
});

// Eliminar un usuario
router.delete("/users/:id", auth, isAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    const adminUser = await User.findById(req.userId).select("nombre apellido email");

    await registrarEvento(
      "usuario_eliminado",
      `El administrador ${adminUser.nombre} ${adminUser.apellido} (${adminUser.email}) eliminó al usuario ${deletedUser.email}`
    );

    if (!deletedUser) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.status(200).json({ msg: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ msg: "Error al eliminar usuario", error: err.message });
  }
});

// Actualizar datos básicos de un usuario (nombre, email, teléfono, y AHORA especialidad)
router.put("/users/:id", auth, isAdmin, async (req, res) => {
  try {
    // Se extrae 'apellido' y el nuevo campo 'especialidad'
    const { nombre, apellido, email, telephone, especialidad } = req.body; 

    // LOGS DE DEPURACIÓN
    console.log("Datos recibidos en PUT /users/:id:", req.body);
    console.log("Especialidad recibida:", especialidad);

    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
        return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    
    // Construimos el objeto de actualización de forma segura
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (email !== undefined) updateData.email = email;
    if (telephone !== undefined) updateData.telephone = telephone;

    // CORRECCIÓN: Permitir siempre actualizar especialidad cuando se envía
    if (especialidad !== undefined) {
        updateData.especialidad = especialidad === '' ? null : especialidad; 
    }

    console.log("Datos a actualizar en BD:", updateData);

    // VALIDACIONES DE FORMATO
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ msg: "Formato de email no válido" });
    }
    if (telephone && !/^[0-9]{9}$/.test(telephone)) {
      return res.status(400).json({ msg: "El teléfono debe tener 9 dígitos" });
    }
    
    // VALIDACIÓN DE DATOS OBLIGATORIOS (si se envían)
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ msg: "No se enviaron datos válidos para actualizar" });
    }

    // Ejecutar la actualización
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    console.log("Usuario actualizado:", user);

    const adminUser = await User.findById(req.userId).select("nombre apellido email");
    await registrarEvento(
      "usuario_editado",
      `El administrador ${adminUser.nombre} ${adminUser.apellido} (${adminUser.email}) editó los datos de ${user.email}`
    );

    res.status(200).json({ msg: "Usuario actualizado correctamente", user });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ msg: "Error del servidor", error: err.message });
  }
});

// Estadísticas generales del sistema (para AdminDashboard)
router.get("/stats", auth, isAdmin, async (req, res) => {
  try {
    const totalUsuarios = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ rol: "admin" });
    const totalFisio = await User.countDocuments({ rol: "fisioterapeuta" });
    const totalClientes = await User.countDocuments({ rol: "cliente" });

    res.status(200).json({
      totalUsuarios,
      totalAdmins,
      totalFisio,
      totalClientes,
    });
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    res.status(500).json({ msg: "Error al obtener estadísticas" });
  }
});

// Eventos recientes del sistema (para AdminDashboard)
router.get("/eventos-recientes", auth, isAdmin, async (req, res) => {
  try {
    const eventos = await EventLog.find()
      .sort({ fecha: -1 })   // más recientes primero
      .limit(20)             // máximo 20 eventos
      .lean();

    res.status(200).json(eventos);
  } catch (err) {
    console.error("Error al obtener eventos recientes:", err);
    res.status(500).json({ msg: "Error al obtener eventos recientes" });
  }
});

module.exports = router;