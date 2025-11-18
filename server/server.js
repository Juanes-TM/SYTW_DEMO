// ==================== DEPENDENCIAS ====================
const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

// ==================== CONFIGURACIÓN ====================
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Leer configuración externa
const configPath = '/home/usuario/backend_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const MONGO_URI = config.MONGO_URI;

// ==================== CONEXIÓN A MONGODB ====================
mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });

// ==================== RUTAS BACKEND ====================
const authRoutes = require('./routes/auth');
const adminRoutes = require("./routes/admin");
const citasRoutes = require('./routes/citas');
const fisioRoutes = require("./routes/fisioterapeutas");
const profileRoutes = require('./routes/profile');


app.use('/api/admin', adminRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/fisioterapeutas', fisioRoutes);
app.use('/api/profile', profileRoutes);   
app.use('/api', authRoutes);              // login, register, forgot, reset, etc.

// ==================== FRONTEND (React compilado) ====================
const CLIENT_DIST_PATH = path.join(__dirname, '../client/dist');
app.use(express.static(CLIENT_DIST_PATH));

// --- FALLBACK SOLAMENTE PARA RUTAS *NO API* ---
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(CLIENT_DIST_PATH, 'index.html'));
});

// ==================== INICIO DEL SERVIDOR ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor BACKEND escuchando en puerto ${PORT}`);
});
