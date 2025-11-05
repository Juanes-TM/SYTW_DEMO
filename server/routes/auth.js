// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const router = express.Router();

// Cargar configuración externa (ruta absoluta al backend_config.json)
const configPath = '/home/usuario/backend_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

router.post('/register', async (req, res) => {
  const { nombre, apellido, email, password, telephone } = req.body;

  // Validar que todos los campos existan
  if (!nombre || !apellido || !email || !password || !telephone) {
    return res.status(400).json({ msg: 'Faltan datos' });
  }

  try {
    // Verificar que el correo no esté registrado
    const existente = await User.findOne({ email });
    if (existente) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      telephone,
      rol: 'cliente'
    });

    // Guardar en la base de datos
    await nuevoUsuario.save();

    // Responder con éxito
    res.status(201).json({ msg: 'Usuario registrado correctamente' });

  } catch (err) {
    console.error('Error en el registro:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

 // Inicio de sesión con autenticación por token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Verificar que los campos existan
  if (!email || !password) {
    return res.status(400).json({ msg: 'Faltan credenciales' });
  }

  try {
    // Buscar usuario por correo
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    // Comparar contraseñas
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    // Generar token JWT válido por 1 hora
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      config.JWT_SECRET, // Se lee del backend_config.json
      { expiresIn: '1h' }
    );

    // Enviar token como respuesta
   res.status(200).json({
   msg: 'Inicio de sesión correcto',
   token,
   user: {
     nombre: usuario.nombre,
     apellido: usuario.apellido,
     email: usuario.email,
     rol: usuario.rol
     }
   });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
