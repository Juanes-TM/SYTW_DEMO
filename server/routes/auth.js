// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const router = express.Router();
const EventLog = require("../models/eventLog");


// Cargar configuración externa (ruta absoluta al backend_config.json)
const configPath = './backend_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// -------------------------
// REGISTRO DE USUARIO
// -------------------------
router.post('/register', async (req, res) => {

  const { nombre, apellido, email, password, password2, telephone } = req.body;

  if (!nombre || !apellido || !email || !password || !password2 || !telephone) {
    return res.status(400).json({ msg: 'Faltan datos, todos los campos son obligatorios' });
  }
  
  // Comprobar formato del email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: 'Formato de email no válido' });
  }

  // Contraseña de longitud mínima 6
  if (password.length < 6) {
    return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Repetir contraseña
  if (password != password2) {
    return res.status(400).json({ msg: 'Las contraseñas no coinciden' });  }

  // Teléfono válido (9 números)
  const telRegex = /^[0-9]{9}$/
  if (!telRegex.test(telephone)) {
    return res.status(400).json({ msg: 'El teléfono debe tener 9 dígitos'});
  }

  try {
    const existente = await User.findOne({ email });
    if (existente) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new User({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      telephone,
      rol: 'cliente',
      // 'especialidad' se crea como null por defecto
    });

    await nuevoUsuario.save();

    await EventLog.create({
      tipo: "usuario_registrado",
      descripcion: `Nuevo usuario registrado: ${nombre} ${apellido} (${email})`,
    });

    res.status(201).json({ msg: 'Usuario registrado correctamente' });

  } catch (err) {
    console.error('Error en el registro:', err);
    res.status(500).json({
      msg: 'Error del servidor',
      error: err.message,
      stack: err.stack
    });
  }
});

// -------------------------
// LOGIN DE USUARIO
// -------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Comprobar formato email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ msg: 'El email no tiene formato válido' });
  }

  if (!password) {
    return res.status(400).json({ msg: 'Por favor, introduce la contraseña' });
  }

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      config.JWT_SECRET, // Se lee del backend_config.json
      { expiresIn: '1h' }
    );

    res.status(200).json({
      msg: 'Inicio de sesión correcto',
      token,
      user: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telephone: usuario.telephone,
        rol: usuario.rol,
        especialidad: usuario.especialidad // AÑADIDO: Incluimos la especialidad
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


// Obtener perfil de usuario ya autenticado
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // CAMBIO: Aseguramos que el perfil traiga el campo 'especialidad'
    const usuario = await User.findById(req.userId).select('-password -resetPasswordToken -resetPasswordExpires -__v');
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.status(200).json({ user: usuario });
  } catch (err) {
    console.error('Error en profile:', err);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});



// Recuperación de contraseñas
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email requerido' });

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ msg: 'El correo no está registrado' });
    }
    // Generamos token seguro que expira en 1 hora
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600 * 1000;

    // Guardamos el token
    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = new Date(expires);
    await usuario.save();

    //const resetLink = "http://172.16.0.1/reset-password?token=" + token + "&email=" + encodeURIComponent(email);
    const resetLink = `http://172.16.0.1/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Devolvemos el enlace
    return res.status(200).json({
      msg: 'Token de recuperación creado', resetLink
    });
  } catch (err) {
    console.error('Error en forgot-password:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});


// Resetear la contraseña
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ msg: 'Faltan parámetros' });
  }

  try {
    const usuario = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!usuario) {
      return res.status(400).json({ msg: 'Token inválido o expirado' });
    }

    // Hashear la nueva contraseña con bcryptjs
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);
    usuario.password = hashed;

    // Eliminamos campos de reset
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;
    await usuario.save();

    return res.status(200).json({ msg: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error en reset-password:', err);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
});

module.exports = router;