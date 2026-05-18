require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Asegurar que la carpeta uploads exista (necesario en Render y otros proveedores)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Importar rutas
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const publicationRoutes = require("./routes/publications");
const favoriteRoutes = require("./routes/favorites");
const orderRoutes = require("./routes/orders");

const app = express();

// ============================================================
//  Middlewares globales
// ============================================================

// CORS: permite localhost en desarrollo y la URL de producción configurada en FRONTEND_URL
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (ej. Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origen no permitido → ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// Parsear datos de formulario URL-encoded
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de la carpeta uploads (imágenes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================================
//  Rutas de la API
// ============================================================
// Rutas con prefijo /api (estándar)
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/orders", orderRoutes);

// Alias sin prefijo /api (compatibilidad con frontend)
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/publications", publicationRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/orders", orderRoutes);

// Ruta raíz de bienvenida
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API REST MktCafé funcionando correctamente ☕",
    version: "1.0.0",
    endpoints: [
      "POST   /api/login",
      "POST   /api/users",
      "GET    /api/users/:id",
      "PUT    /api/users/:id",
      "GET    /api/users/:id/publications",
      "GET    /api/publications",
      "GET    /api/publications/:id",
      "POST   /api/publications",
      "PUT    /api/publications/:id",
      "DELETE /api/publications/:id",
      "GET    /api/favorites",
      "POST   /api/favorites/:publication_id",
      "DELETE /api/favorites/:publication_id",
      "POST   /api/orders",
      "GET    /api/orders",
      "GET    /api/orders/:id",
    ],
  });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err.message);
  res.status(500).json({ error: "Error interno del servidor." });
});

// ============================================================
//  Iniciar servidor
// ============================================================
const PORT = process.env.PORT || 3000;

// Solo levantar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`✅ Servidor MktCafé corriendo en http://localhost:${PORT}`);
  });
}

// Exportar app para que supertest pueda usarla sin levantar el puerto
module.exports = app;
