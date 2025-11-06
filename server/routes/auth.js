// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const router = express.Router();

// Cargar configuración externa (ruta absoluta al backend_config.json)
const configPath = '/home/usuario/backend_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// -------------------------
// REGISTRO DE USUARIO
// -------------------------
router.post('/register', async (req, res) => {
  const { nombre, apellido, email, password, telephone } = req.body;

  if (!nombre || !apellido || !email || !password || !telephone) {
    return res.status(400).json({ msg: 'Faltan datos' });
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
      rol: 'cliente'
    });

    await nuevoUsuario.save();

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

  if (!email || !password) {
    return res.status(400).json({ msg: 'Faltan credenciales' });
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


// Obtener perfil de usuario ya autenticado
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, async (req, res) => {
	try {
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
			return res.status(200).json({ msg: 'Si el correo existe, se ha enviado un enlace para el reset de la contraseña' });
		}
		// Generamos token seguro que expira en 1 hora
		const token = crypto.randomBytes(32).toString('hex');
		const expires = Date.now() + 3600 * 1000;

		// Guardamos el token
		usuario.resetPasswordToken = token;
		usuario.resetPasswordExpires = new Date(expires);
		await usuario.save();

		const resetLink = "http://172.16.0.1/reset-password?token=" + token + "&email=" + encodeURIComponent(email);

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




// EXPORTAR EL ROUTER
module.exports = router;

