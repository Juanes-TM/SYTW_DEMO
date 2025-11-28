// ==================== DEPENDENCIAS ====================
const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

// ==================== IMPORTAR RUTAS ====================
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const citasRoutes = require("./routes/citas");
const fisioRoutes = require("./routes/fisioterapeutas");
const disponibilidadRoutes = require("./routes/disponibilidad");
const valoracionesRoutes = require("./routes/valoraciones"); // NUEVO desde rama citas

// ==================== MONTAR RUTAS API ====================
app.use("/api/citas", citasRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fisioterapeutas", fisioRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/valoraciones", valoracionesRoutes); // NUEVO desde rama citas
app.use("/api", authRoutes);

// ==================== FRONTEND REACT ====================
const CLIENT_DIST_PATH = path.join(__dirname, "../client/dist");
app.use(express.static(CLIENT_DIST_PATH));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(CLIENT_DIST_PATH, "index.html"));
});

// ==========================================
// SEGURO DE VIDA PARA TU BASE DE DATOS
// ==========================================
// Esto asegura que la conexión REAL solo ocurra si ejecutas el servidor manualmente.
// Si el test importa este archivo, esto devuelve FALSE y NO se conecta a la DB real.

if (require.main === module) {
  // ==================== CONFIG EXTERNA ====================
  const configPath = "/home/usuario/backend_config.json";
  
  // Leemos la config directamente
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const MONGO_URI = config.MONGO_URI;

  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(">>> CONECTADO A MONGODB (Entorno REAL - NO EJECUTAR TESTS AQUÍ) <<<");
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Servidor BACKEND escuchando en puerto ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Error crítico en MongoDB:", err);
      process.exit(1);
    });
}

// Exportamos la app para que el test la use sin arrancar la DB real
module.exports = app;