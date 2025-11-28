// ==================== DEPENDENCIAS ====================
const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==================== IMPORTAR RUTAS ====================
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const citasRoutes = require("./routes/citas");
const fisioRoutes = require("./routes/fisioterapeutas");
const disponibilidadRoutes = require("./routes/disponibilidad");
const valoracionesRoutes = require("./routes/valoraciones");

// ==================== MONTAR RUTAS API ====================
app.use("/api/citas", citasRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fisioterapeutas", fisioRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/valoraciones", valoracionesRoutes);
app.use("/api", authRoutes);

// ==================== FRONTEND REACT ====================
const CLIENT_DIST_PATH = path.join(__dirname, "../client/dist");
app.use(express.static(CLIENT_DIST_PATH));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(CLIENT_DIST_PATH, "index.html"));
});

// ==================== CONEXIÓN A MONGODB ====================
const connectDB = async () => {
  try {
    let config;
    
    // En CI, usar configuración simple
    if (process.env.CI || process.env.NODE_ENV === 'test') {
      const configPath = path.join(__dirname, "backend_config.json");
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } else {
      // En producción, usar ruta original
      const configPath = "/home/usuario/backend_config.json";
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    
    const MONGO_URI = config.MONGO_URI;
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(">>> CONECTADO A MONGODB <<<");
    return true;
  } catch (err) {
    console.error("Error conectando a MongoDB:", err);
    return false;
  }
};

// ==================== INICIAR SERVIDOR ====================
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected && (process.env.CI || process.env.NODE_ENV === 'test')) {
    console.log("⚠️  No se pudo conectar a MongoDB, pero continuamos para tests...");
  }
  
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor BACKEND escuchando en puerto ${PORT}`);
  });
  
  return server;
};

// Solo iniciar si es el archivo principal (no cuando lo requieren los tests)
if (require.main === module) {
  startServer().catch(console.error);
}

// Exportar para tests
module.exports = { app, startServer };