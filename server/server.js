console.log("📌 SERVER.JS EJECUTÁNDOSE DE VERDAD");

// ==================== DEPENDENCIAS ====================
const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

// ==================== CONFIG EXTERNA ====================
const configPath = "/home/usuario/backend_config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const MONGO_URI = config.MONGO_URI;

// ==================== CONEXIÓN A MONGO ====================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => {
    console.error("Error en MongoDB:", err);
    process.exit(1);
  });

// ==================== IMPORTAR RUTAS ====================
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const citasRoutes = require("./routes/citas");
const fisioRoutes = require("./routes/fisioterapeutas");
const disponibilidadRoutes = require("./routes/disponibilidad");
const valoracionesRoutes = require("./routes/valoraciones");
const notificacionesRoutes = require("./routes/notificaciones");
const iniciarCron = require("./services/cronService");
console.log("📌 CRON IMPORTADO CORRECTAMENTE");


// ==================== MONTAR RUTAS API ====================

app.use("/api/citas", citasRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fisioterapeutas", fisioRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/valoraciones", valoracionesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
iniciarCron();
console.log("📌 iniciarCron() INVOCADO");
app.use("/api", authRoutes);

// ==================== FRONTEND REACT ====================
const CLIENT_DIST_PATH = path.join(__dirname, "../client/dist");
app.use(express.static(CLIENT_DIST_PATH));

// Atrapamos cualquier ruta no-API
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(CLIENT_DIST_PATH, "index.html"));
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor BACKEND escuchando en puerto ${PORT}`);
});
