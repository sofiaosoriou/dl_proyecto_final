# Guía Completa: Construir MktCafé desde Cero

> **MktCafé** es un marketplace de cafés de especialidad. Los usuarios pueden registrarse, publicar cafés para vender, explorar la tienda, agregar favoritos, hacer pedidos y gestionar su perfil.

Esta guía te lleva desde cero — sin suponer que ya tienes nada instalado.

---

## ÍNDICE

1. [¿Qué vas a construir?](#1-qué-vas-a-construir)
2. [Herramientas que necesitas instalar](#2-herramientas-que-necesitas-instalar)
3. [BACKEND — Node.js + Express + PostgreSQL](#3-backend)
   - 3.1 Crear el proyecto
   - 3.2 Configurar la base de datos
   - 3.3 Conectar Node con PostgreSQL
   - 3.4 El servidor principal (index.js)
   - 3.5 Middleware de autenticación JWT
   - 3.6 Ruta: Registro y Login
   - 3.7 Ruta: Usuarios (perfil)
   - 3.8 Ruta: Publicaciones
   - 3.9 Ruta: Favoritos
   - 3.10 Ruta: Pedidos
   - 3.11 Probar el backend
4. [FRONTEND — React + Vite + Bootstrap](#4-frontend)
   - 4.1 Crear el proyecto
   - 4.2 Instalar dependencias
   - 4.3 Configurar Axios
   - 4.4 Servicios (llamadas a la API)
   - 4.5 Context: Autenticación (AuthContext)
   - 4.6 Context: Carrito (CartContext)
   - 4.7 Componentes base: Navbar, Footer, PrivateRoute
   - 4.8 Páginas: Home, Login, Register
   - 4.9 Páginas: Gallery (Tienda), PublicationDetail
   - 4.10 Páginas: Profile, Orders
   - 4.11 Páginas: MyPublications, CreatePublication, EditPublication
   - 4.12 Página: Cart (Carrito + Checkout)
   - 4.13 Conectar todo en App.jsx
5. [Ejecutar el proyecto completo](#5-ejecutar-el-proyecto-completo)

---

## 1. ¿Qué vas a construir?

### Arquitectura general

```
[Navegador / React]  ←→  [API Express]  ←→  [PostgreSQL]
     Frontend              Backend             Base de datos
   puerto 5173           puerto 3000
```

- El **frontend** es lo que el usuario ve: páginas, formularios, botones.
- El **backend** es el servidor que recibe peticiones HTTP, consulta la base de datos y devuelve datos.
- La **base de datos** guarda toda la información: usuarios, publicaciones, pedidos, favoritos.

### Flujo típico de una acción

1. El usuario hace clic en "Iniciar sesión".
2. React envía una petición `POST /api/login` con email y contraseña.
3. Express recibe la petición, busca el usuario en PostgreSQL, verifica la contraseña y genera un token JWT.
4. React recibe el token, lo guarda en `localStorage` y redirige al usuario.

---

## 2. Herramientas que necesitas instalar

### 2.1 Node.js (versión 18 o superior)

Descarga desde: https://nodejs.org  
Elige la versión **LTS** (la recomendada).

Verifica que quedó instalado:
```bash
node --version
npm --version
```

### 2.2 PostgreSQL

Descarga desde: https://www.postgresql.org/download/  
Durante la instalación, anota la contraseña que le pones al usuario `postgres`.

Verifica:
```bash
psql --version
```

### 2.3 Visual Studio Code

Descarga desde: https://code.visualstudio.com  

Extensiones recomendadas (instálalas desde el panel de extensiones de VS Code):
- **ESLint** — detecta errores en tu código JavaScript
- **Prettier** — formatea automáticamente el código
- **PostgreSQL** (Chris Kolkman) — para ver tu base de datos desde VS Code

### 2.4 Postman o Bruno (opcional pero muy útil)

Te permite probar los endpoints del backend sin necesidad de tener el frontend listo.
- Postman: https://www.postman.com/downloads/

---

## 3. BACKEND

### 3.1 Crear el proyecto

Abre una terminal y ejecuta:

```bash
mkdir mktcafe-backend
cd mktcafe-backend
npm init -y
```

**¿Qué hace `npm init -y`?**  
Crea el archivo `package.json`, que es el "carnet de identidad" de tu proyecto Node. Registra el nombre del proyecto, la versión y las dependencias que instales.

Ahora instala las dependencias:

```bash
npm install express pg bcryptjs jsonwebtoken cors dotenv multer
npm install --save-dev nodemon
```

**¿Qué instala cada paquete?**
- `express` — el framework para crear el servidor HTTP y las rutas
- `pg` — el driver para conectarse a PostgreSQL desde Node
- `bcryptjs` — para hashear (cifrar) contraseñas, nunca guardar texto plano
- `jsonwebtoken` — para crear y verificar tokens JWT (autenticación)
- `cors` — para permitir que el frontend (en otro puerto) hable con el backend
- `dotenv` — para leer variables de entorno desde un archivo `.env`
- `multer` — para recibir archivos (imágenes) en los formularios
- `nodemon` — reinicia el servidor automáticamente cuando cambias un archivo (solo en desarrollo)

Agrega los scripts en `package.json`:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

Crea el archivo `.env` en la raíz del proyecto:

```
PORT=3000
JWT_SECRET=mi_secreto_super_seguro_cambiar_en_produccion
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mktcafe
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres
```

**Importante:** agrega `.env` al `.gitignore` para no subir contraseñas a GitHub.

```bash
echo ".env" > .gitignore
echo "node_modules/" >> .gitignore
echo "uploads/" >> .gitignore
```

Crea la estructura de carpetas:

```bash
mkdir db middleware routes uploads
```

Tu estructura debe quedar así:
```
mktcafe-backend/
├── db/
│   ├── config.js
│   └── schema.sql
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── publications.js
│   ├── favorites.js
│   └── orders.js
├── uploads/          ← aquí se guardan las imágenes subidas
├── .env
├── .gitignore
├── index.js
└── package.json
```

---

### 3.2 Configurar la base de datos

Abre `psql` (la terminal de PostgreSQL) y crea la base de datos:

```sql
CREATE DATABASE mktcafe;
\c mktcafe
```

Ahora crea el archivo `db/schema.sql` con todas las tablas:

```sql
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  foto_url    TEXT,
  bio         TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabla de publicaciones (cafés a la venta)
CREATE TABLE IF NOT EXISTS publication (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo          VARCHAR(200) NOT NULL,
  descripcion     TEXT,
  precio          NUMERIC(10, 2) NOT NULL,
  tipo_molienda   VARCHAR(50),
  tipo_tueste     VARCHAR(50),
  origen_pais     VARCHAR(100),
  origen_region   VARCHAR(100),
  imagen_url      TEXT,
  stock           INTEGER DEFAULT 0,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS "order" (
  id          SERIAL PRIMARY KEY,
  buyer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total       NUMERIC(10, 2) NOT NULL,
  estado      VARCHAR(50) DEFAULT 'pendiente',
  direccion   TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabla de ítems de cada pedido
CREATE TABLE IF NOT EXISTS order_item (
  id                SERIAL PRIMARY KEY,
  order_id          INTEGER NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  publication_id    INTEGER NOT NULL REFERENCES publication(id),
  cantidad          INTEGER NOT NULL,
  precio_unitario   NUMERIC(10, 2) NOT NULL
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorito (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publication_id  INTEGER NOT NULL REFERENCES publication(id) ON DELETE CASCADE,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, publication_id)
);
```

**¿Por qué estas tablas?**
- `users` — los compradores y vendedores
- `publication` — los cafés que los vendedores publican
- `order` / `order_item` — los pedidos (un pedido puede tener varios cafés)
- `favorito` — lista de cafés que le gustan al usuario

**Las relaciones (REFERENCES)** conectan las tablas. Por ejemplo, `publication.user_id REFERENCES users(id)` significa "cada publicación pertenece a un usuario". `ON DELETE CASCADE` significa "si se borra el usuario, se borran también sus publicaciones".

Ejecuta el schema desde la terminal:

```bash
psql -U postgres -d mktcafe -f db/schema.sql
```

---

### 3.3 Conectar Node con PostgreSQL

Crea `db/config.js`:

```javascript
const { Pool } = require("pg");
require("dotenv").config();

// Pool = grupo de conexiones reutilizables a la base de datos
// Es más eficiente que abrir y cerrar una conexión por cada consulta

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "mktcafe",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
    });

pool.on("error", (err) => {
  console.error("Error en PostgreSQL:", err.message);
  process.exit(-1);
});

module.exports = pool;
```

**¿Qué es un Pool?**  
En lugar de abrir una conexión nueva cada vez que alguien hace una petición, el Pool mantiene varias conexiones abiertas y las reutiliza. Mucho más eficiente.

---

### 3.4 El servidor principal (index.js)

Crea `index.js`:

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Crear carpeta uploads si no existe (necesario al desplegar)
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

// ── Middlewares globales ─────────────────────────────────────
// CORS: permite que el frontend (otro puerto/dominio) hable con la API
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parsear JSON: transforma el body de las peticiones de texto a objeto JavaScript
app.use(express.json());

// Parsear formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Servir imágenes estáticamente (ej: GET /uploads/foto.jpg)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Rutas ────────────────────────────────────────────────────
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/orders", orderRoutes);

// Ruta raíz de bienvenida
app.get("/", (req, res) => {
  res.json({ message: "API MktCafé funcionando ☕", version: "1.0.0" });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

// Manejo global de errores (los errores llegan aquí cuando usas next(err))
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Error interno del servidor." });
});

// ── Iniciar servidor ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
```

**Conceptos clave:**
- **Middleware**: una función que se ejecuta entre que llega la petición y se envía la respuesta. `app.use(express.json())` es un middleware que transforma el body de JSON a objeto JavaScript antes de que llegue a tu ruta.
- **CORS**: por seguridad, los navegadores bloquean peticiones a un dominio/puerto diferente. CORS le dice al navegador "sí, permito peticiones desde ese origen".

---

### 3.5 Middleware de autenticación JWT

Crea `middleware/auth.js`:

```javascript
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  // El token viene en el header Authorization: "Bearer <token>"
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado." });
  }

  // Extraer el token (quitar el prefijo "Bearer ")
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    // Verificar que el token sea válido y no haya expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto_dev");
    // Guardar los datos del usuario en req.user para usarlos en la ruta
    req.user = decoded;
    next(); // continuar al siguiente middleware o a la ruta
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};

module.exports = { verifyToken };
```

**¿Qué es JWT (JSON Web Token)?**  
Cuando un usuario inicia sesión correctamente, el servidor genera un "token" firmado que contiene su ID y email. El cliente guarda este token y lo envía en cada petición privada. El servidor verifica la firma para saber que el token es auténtico y no fue manipulado.

---

### 3.6 Ruta: Registro y Login

Crea `routes/auth.js`:

```javascript
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/config");

// POST /api/register — Registrar nuevo usuario
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  // Validación básica
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." });
  }

  try {
    // Verificar si el email ya existe
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    // Hashear la contraseña (nunca guardar texto plano)
    // bcrypt.genSalt(10) genera una "sal" — datos aleatorios que se mezclan con
    // la contraseña para que dos contraseñas iguales tengan hashes distintos
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar el usuario en la base de datos
    const result = await pool.query(
      `INSERT INTO users (nombre, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email`,
      [nombre, email, hashedPassword]
    );

    res.status(201).json({
      message: "Usuario creado",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /api/login — Iniciar sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios." });
  }

  try {
    // Buscar usuario por email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      // No revelar si el email existe o no (seguridad)
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const user = result.rows[0];

    // Comparar contraseña con el hash guardado
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    // Generar token JWT
    // El payload contiene datos NO sensibles (id, email, nombre)
    // El token expira en 24 horas
    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre },
      process.env.JWT_SECRET || "secreto_dev",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        foto_url: user.foto_url,
      },
    });
  } catch (error) {
    console.error("Error en login:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
```

---

### 3.7 Ruta: Usuarios (perfil)

Crea `routes/users.js`:

```javascript
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../db/config");
const { verifyToken } = require("../middleware/auth");

// POST /api/users — Registrar usuario (alias del register)
router.post("/", async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email`,
      [nombre, email, hashedPassword]
    );

    res.status(201).json({ message: "Usuario creado", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /api/users/:id — Obtener perfil público de un usuario
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, email, bio, foto_url, created_at FROM users WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// PUT /api/users/:id — Actualizar perfil (requiere autenticación)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, bio, foto_url } = req.body;

  // Solo puedes editar TU perfil
  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ error: "No tienes permiso para modificar este perfil." });
  }

  try {
    // COALESCE($1, nombre) significa: si $1 es null, usa el valor actual
    // Así solo actualizas los campos que envíes
    const result = await pool.query(
      `UPDATE users
       SET nombre   = COALESCE($1, nombre),
           bio      = COALESCE($2, bio),
           foto_url = COALESCE($3, foto_url)
       WHERE id = $4
       RETURNING id, nombre, bio, foto_url`,
      [nombre || null, bio || null, foto_url || null, id]
    );

    res.status(200).json({ message: "Perfil actualizado", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /api/users/:id/publications — Publicaciones de un usuario
router.get("/:id/publications", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, titulo, precio, stock, created_at
       FROM publication WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
```

---

### 3.8 Ruta: Publicaciones

Crea `routes/publications.js`:

```javascript
const express = require("express");
const router = express.Router();
const pool = require("../db/config");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configurar multer para guardar imágenes en la carpeta uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + número aleatorio + extensión original
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const isImage = /jpeg|jpg|png|webp/.test(
      path.extname(file.originalname).toLowerCase()
    );
    isImage ? cb(null, true) : cb(new Error("Solo se permiten imágenes."));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
});

// GET /api/publications — Listar publicaciones con filtros opcionales
router.get("/", async (req, res) => {
  const { tipo_molienda, search, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Construir la query dinámicamente según los filtros
  let query = `
    SELECT p.id, p.titulo, p.precio, p.tipo_molienda, p.origen_pais, p.imagen_url,
           json_build_object('id', u.id, 'nombre', u.nombre) AS vendedor
    FROM publication p
    JOIN users u ON p.user_id = u.id
    WHERE p.active = true
  `;
  const params = [];
  let i = 1;

  if (tipo_molienda) {
    query += ` AND p.tipo_molienda = $${i++}`;
    params.push(tipo_molienda);
  }

  if (search) {
    query += ` AND (p.titulo ILIKE $${i} OR p.origen_pais ILIKE $${i} OR p.origen_region ILIKE $${i})`;
    params.push(`%${search}%`);
    i++;
  }

  query += ` ORDER BY p.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
  params.push(parseInt(limit), offset);

  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /api/publications/mine — Mis publicaciones (activas e inactivas)
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, titulo, precio, stock, imagen_url, active, created_at
       FROM publication WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /api/publications/:id — Detalle de una publicación
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.titulo, p.descripcion, p.precio, p.tipo_molienda, p.tipo_tueste,
              p.origen_pais, p.origen_region, p.imagen_url, p.stock, p.created_at,
              json_build_object('id', u.id, 'nombre', u.nombre, 'foto_url', u.foto_url) AS vendedor
       FROM publication p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /api/publications — Crear publicación (requiere auth)
// upload.single("imagen") indica que esperamos UN archivo con el campo "imagen"
router.post("/", verifyToken, upload.single("imagen"), async (req, res) => {
  const { titulo, descripcion, precio, tipo_molienda, tipo_tueste,
          origen_pais, origen_region, stock } = req.body;

  if (!titulo || !precio) {
    return res.status(400).json({ error: "Título y precio son obligatorios." });
  }

  // Si se subió imagen, guardamos la ruta relativa
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO publication
         (user_id, titulo, descripcion, precio, tipo_molienda, tipo_tueste,
          origen_pais, origen_region, stock, imagen_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, titulo, precio`,
      [req.user.id, titulo, descripcion || null, parseFloat(precio),
       tipo_molienda || null, tipo_tueste || null, origen_pais || null,
       origen_region || null, parseInt(stock) || 0, imagen_url]
    );

    res.status(201).json({ message: "Publicación creada", publication: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// PUT /api/publications/:id — Editar publicación propia
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, precio, stock, tipo_molienda } = req.body;

  try {
    // Verificar que la publicación existe y es del usuario
    const check = await pool.query(
      "SELECT user_id FROM publication WHERE id = $1", [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }
    if (check.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para editar esta publicación." });
    }

    const result = await pool.query(
      `UPDATE publication
       SET titulo        = COALESCE($1, titulo),
           descripcion   = COALESCE($2, descripcion),
           precio        = COALESCE($3, precio),
           stock         = COALESCE($4, stock),
           tipo_molienda = COALESCE($5, tipo_molienda)
       WHERE id = $6
       RETURNING id, titulo, precio, stock`,
      [titulo || null, descripcion || null,
       precio ? parseFloat(precio) : null,
       stock !== undefined ? parseInt(stock) : null,
       tipo_molienda || null, id]
    );

    res.status(200).json({ message: "Publicación actualizada", publication: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// DELETE /api/publications/:id — Pausar publicación (soft delete)
// "Soft delete" = no borrar, solo marcar como inactiva (active = false)
// Así se preserva el historial de pedidos
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      "SELECT user_id FROM publication WHERE id = $1", [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }
    if (check.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso." });
    }

    await pool.query("UPDATE publication SET active = false WHERE id = $1", [id]);
    res.status(200).json({ message: "Publicación pausada" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
```

---

### 3.9 Ruta: Favoritos

Crea `routes/favorites.js`:

```javascript
const express = require("express");
const router = express.Router();
const pool = require("../db/config");
const { verifyToken } = require("../middleware/auth");

// GET /api/favorites — Obtener mis favoritos
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.titulo, p.precio, p.imagen_url,
              json_build_object('id', u.id, 'nombre', u.nombre) AS vendedor
       FROM favorito f
       JOIN publication p ON f.publication_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /api/favorites/:publication_id — Agregar a favoritos
router.post("/:publication_id", verifyToken, async (req, res) => {
  const { publication_id } = req.params;

  try {
    const pub = await pool.query(
      "SELECT id FROM publication WHERE id = $1", [publication_id]
    );
    if (pub.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }

    // ON CONFLICT DO NOTHING: si ya existe el favorito, no hace nada (no lanza error)
    const result = await pool.query(
      `INSERT INTO favorito (user_id, publication_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, publication_id) DO NOTHING
       RETURNING user_id, publication_id`,
      [req.user.id, publication_id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Ya está en tus favoritos." });
    }

    res.status(201).json({ message: "Agregado a favoritos", favorite: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// DELETE /api/favorites/:publication_id — Eliminar de favoritos
router.delete("/:publication_id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM favorito WHERE user_id = $1 AND publication_id = $2 RETURNING id",
      [req.user.id, req.params.publication_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "El favorito no existe." });
    }

    res.status(200).json({ message: "Eliminado de favoritos" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
```

---

### 3.10 Ruta: Pedidos

Crea `routes/orders.js`:

```javascript
const express = require("express");
const router = express.Router();
const pool = require("../db/config");
const { verifyToken } = require("../middleware/auth");

// POST /api/orders — Crear pedido desde el carrito
router.post("/", verifyToken, async (req, res) => {
  const { direccion, items } = req.body;
  // items = [{ publication_id: 1, cantidad: 2 }, ...]

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El carrito no puede estar vacío." });
  }

  // Transacción: todas las operaciones deben completarse o ninguna
  // Si algo falla a mitad, se hace ROLLBACK para no dejar datos inconsistentes
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let total = 0;
    const itemsWithPrice = [];

    for (const item of items) {
      const pub = await client.query(
        "SELECT id, precio, stock FROM publication WHERE id = $1",
        [item.publication_id]
      );

      if (pub.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          error: `Publicación ${item.publication_id} no encontrada.`,
        });
      }

      const publication = pub.rows[0];

      if (publication.stock < item.cantidad) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Stock insuficiente para la publicación ${item.publication_id}.`,
        });
      }

      total += parseFloat(publication.precio) * item.cantidad;
      itemsWithPrice.push({
        publication_id: item.publication_id,
        cantidad: item.cantidad,
        precio_unitario: publication.precio,
      });
    }

    // Crear el pedido
    const orderResult = await client.query(
      `INSERT INTO "order" (buyer_id, total, estado, direccion)
       VALUES ($1, $2, 'pendiente', $3)
       RETURNING id, buyer_id, total, estado, created_at`,
      [req.user.id, total, direccion || null]
    );

    const order = orderResult.rows[0];

    // Crear los ítems y descontar stock
    for (const item of itemsWithPrice) {
      await client.query(
        `INSERT INTO order_item (order_id, publication_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.publication_id, item.cantidad, item.precio_unitario]
      );

      await client.query(
        "UPDATE publication SET stock = stock - $1 WHERE id = $2",
        [item.cantidad, item.publication_id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Pedido creado", order });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear pedido:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    client.release();
  }
});

// GET /api/orders — Historial de pedidos del usuario
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total, o.estado, o.created_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'titulo', p.titulo,
                    'cantidad', oi.cantidad,
                    'precio_unitario', oi.precio_unitario
                  )
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) AS items
       FROM "order" o
       LEFT JOIN order_item oi ON oi.order_id = o.id
       LEFT JOIN publication p ON p.id = oi.publication_id
       WHERE o.buyer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /api/orders/:id — Detalle de un pedido
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const orderResult = await pool.query(
      `SELECT id, total, estado, direccion, created_at FROM "order"
       WHERE id = $1 AND buyer_id = $2`,
      [req.params.id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    const itemsResult = await pool.query(
      `SELECT oi.publication_id, p.titulo, oi.cantidad, oi.precio_unitario
       FROM order_item oi
       JOIN publication p ON oi.publication_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    res.status(200).json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
```

---

### 3.11 Probar el backend

Inicia el servidor:

```bash
npm run dev
```

Deberías ver: `✅ Servidor corriendo en http://localhost:3000`

Prueba con Postman o con curl:

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@test.com","password":"123456"}'

# Iniciar sesión
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@test.com","password":"123456"}'

# Ver publicaciones
curl http://localhost:3000/api/publications
```

---

## 4. FRONTEND

### 4.1 Crear el proyecto

Abre otra terminal (el backend debe seguir corriendo en la anterior):

```bash
npm create vite@latest mktcafe-frontend -- --template react
cd mktcafe-frontend
npm install
```

**¿Qué es Vite?**  
Es el bundler (empaquetador) moderno para React. Mucho más rápido que Create React App. Transforma tu código JSX a JavaScript que el navegador entiende.

---

### 4.2 Instalar dependencias

```bash
npm install react-router-dom axios react-hook-form bootstrap
```

- `react-router-dom` — manejo de rutas (páginas) en React
- `axios` — cliente HTTP para llamar a la API del backend
- `react-hook-form` — manejo de formularios con validación
- `bootstrap` — estilos CSS predefinidos (botones, grilla, cards, etc.)

---

### 4.3 Configurar Axios

Crea `src/services/axiosConfig.js`:

```javascript
import axios from "axios";

// Crear una instancia de axios con la URL base de la API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Interceptor de petición: antes de cada request, adjuntar el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mktcafe_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: si el servidor devuelve 401 (no autorizado),
// limpiar la sesión y redirigir al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mktcafe_token");
      localStorage.removeItem("mktcafe_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

Crea el archivo `.env` en la raíz del frontend (`mktcafe-frontend/.env`):

```
VITE_API_URL=http://localhost:3000/api
```

---

### 4.4 Servicios (llamadas a la API)

Crea `src/services/authService.js`:

```javascript
import api from "./axiosConfig";

// Registrar usuario
export const registerUser = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

// Iniciar sesión
export const loginUser = async (credentials) => {
  const response = await api.post("/login", credentials);
  return response.data; // { token, user }
};

// Obtener perfil del usuario autenticado
export const getUserProfile = async () => {
  const user = JSON.parse(localStorage.getItem("mktcafe_user") || "{}");
  const response = await api.get(`/users/${user.id}`);
  return response.data;
};

// Actualizar perfil
export const updateUserProfile = async (profileData) => {
  const user = JSON.parse(localStorage.getItem("mktcafe_user") || "{}");
  const response = await api.put(`/users/${user.id}`, profileData);
  return response.data;
};
```

Crea `src/services/publicationsService.js`:

```javascript
import api from "./axiosConfig";

// Obtener publicaciones (con filtros opcionales)
export const getPublications = async (params = {}) => {
  const response = await api.get("/publications", { params });
  return response.data;
};

// Obtener una publicación por ID
export const getPublicationById = async (id) => {
  const response = await api.get(`/publications/${id}`);
  return response.data;
};

// Crear publicación (con imagen: usa FormData)
export const createPublication = async (formData) => {
  const response = await api.post("/publications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Editar publicación
export const updatePublication = async (id, data) => {
  const response = await api.put(`/publications/${id}`, data);
  return response.data;
};

// Pausar publicación
export const deletePublication = async (id) => {
  const response = await api.delete(`/publications/${id}`);
  return response.data;
};

// Mis publicaciones
export const getMyPublications = async () => {
  const response = await api.get("/publications/mine");
  return response.data;
};

// Crear pedido
export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

// Obtener mis pedidos
export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// Favoritos
export const getFavorites = async () => {
  const response = await api.get("/favorites");
  return response.data;
};

export const addFavorite = async (publicationId) => {
  const response = await api.post(`/favorites/${publicationId}`);
  return response.data;
};

export const removeFavorite = async (publicationId) => {
  const response = await api.delete(`/favorites/${publicationId}`);
  return response.data;
};
```

---

### 4.5 Context: Autenticación (AuthContext)

**¿Qué es React Context?**  
Es una forma de compartir datos entre componentes sin tener que pasar props de padre a hijo a nieto... Context crea un "estado global" que cualquier componente puede leer o modificar.

Crea `src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getUserProfile, updateUserProfile } from "../services/authService";

// 1. Crear el contexto
export const AuthContext = createContext();

// 2. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);

// 3. Provider: componente que envuelve la app y provee los datos
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Al cargar la app, revisar si hay sesión guardada en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("mktcafe_token");
    const savedUser = localStorage.getItem("mktcafe_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Guardar sesión en estado y en localStorage
  const persistSession = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("mktcafe_token", data.token);
    localStorage.setItem("mktcafe_user", JSON.stringify(data.user));
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await loginUser({ email, password });
      persistSession(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
      return false;
    }
  };

  const register = async (nombre, email, password) => {
    setError(null);
    try {
      // Registrar y luego hacer login automáticamente
      await registerUser({ nombre, email, password });
      const data = await loginUser({ email, password });
      persistSession(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("mktcafe_token");
    localStorage.removeItem("mktcafe_user");
    localStorage.removeItem("mktcafe_cart");
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      await updateUserProfile(profileData);
      const fresh = await getUserProfile();
      const updatedUser = fresh.user || fresh;
      setUser(updatedUser);
      localStorage.setItem("mktcafe_user", JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar perfil");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

---

### 4.6 Context: Carrito (CartContext)

Crea `src/context/CartContext.jsx`:

```jsx
import { createContext, useContext, useReducer, useEffect } from "react";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Reducer: función pura que recibe el estado actual y una acción,
// y devuelve el nuevo estado
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((item) => item.id === action.payload.id);
      if (existing) {
        // Si ya está en el carrito, aumentar la cantidad
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Si no está, agregarlo con quantity = 1
      return [...state, { ...action.payload, quantity: 1 }];
    }

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);

    case "UPDATE_QUANTITY":
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  // Inicializar el carrito desde localStorage (persiste entre recargas)
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const saved = localStorage.getItem("mktcafe_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar en localStorage cada vez que el carrito cambie
  useEffect(() => {
    localStorage.setItem("mktcafe_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => dispatch({ type: "ADD_ITEM", payload: product });
  const removeFromCart = (id) => dispatch({ type: "REMOVE_ITEM", payload: id });
  const updateQuantity = (id, quantity) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, total, itemCount, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
```

---

### 4.7 Componentes base

Crea `src/components/PrivateRoute.jsx`:

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Si el usuario no está autenticado, redirigir al login
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
```

Crea `src/components/Navbar.jsx`:

```jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          ☕ MktCafé
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/tienda">Tienda</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/mis-publicaciones">Mis Publicaciones</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/pedidos">Mis Pedidos</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/carrito">
                🛒 Carrito {itemCount > 0 && (
                  <span className="badge bg-warning text-dark">{itemCount}</span>
                )}
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/perfil">👤 {user?.nombre}</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Ingresar</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm ms-2" to="/register">
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

Crea `src/components/Footer.jsx`:

```jsx
const Footer = () => (
  <footer className="bg-dark text-light py-4 mt-auto">
    <div className="container text-center">
      <p className="mb-0">☕ MktCafé — Marketplace de cafés de especialidad</p>
      <small className="text-muted">Desafío Latam — Proyecto Final 2024</small>
    </div>
  </footer>
);

export default Footer;
```

Crea `src/components/ProductCard.jsx`:

```jsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ publication, showActions = false, onDelete, onRestore }) => {
  const { addToCart } = useCart();

  const imageUrl = publication.imagen_url
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${publication.imagen_url}`
    : "https://via.placeholder.com/300x200?text=Sin+imagen";

  return (
    <div className="card h-100 shadow-sm">
      <img
        src={imageUrl}
        className="card-img-top"
        alt={publication.titulo}
        style={{ height: "180px", objectFit: "cover" }}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200?text=Sin+imagen";
        }}
      />
      <div className="card-body d-flex flex-column">
        <h6 className="card-title">{publication.titulo}</h6>
        <p className="text-muted small mb-1">{publication.origen_pais}</p>
        <p className="text-muted small mb-2">{publication.tipo_molienda}</p>
        <p className="fw-bold text-success mt-auto mb-2">
          ${Number(publication.precio).toLocaleString("es-CL")}
        </p>

        {/* showActions = true cuando se usa en "Mis Publicaciones" */}
        {showActions ? (
          <div className="d-flex gap-2">
            <Link
              to={`/publicaciones/${publication.id}/editar`}
              className="btn btn-sm btn-outline-primary flex-grow-1"
            >
              Editar
            </Link>
            {publication.active ? (
              <button
                className="btn btn-sm btn-outline-danger flex-grow-1"
                onClick={() => onDelete && onDelete(publication.id)}
              >
                Pausar
              </button>
            ) : (
              <button
                className="btn btn-sm btn-outline-success flex-grow-1"
                onClick={() => onRestore && onRestore(publication.id)}
              >
                Activar
              </button>
            )}
          </div>
        ) : (
          <div className="d-flex gap-2">
            <Link
              to={`/publicaciones/${publication.id}`}
              className="btn btn-sm btn-outline-secondary flex-grow-1"
            >
              Ver
            </Link>
            <button
              className="btn btn-sm btn-warning flex-grow-1"
              onClick={() => addToCart(publication)}
            >
              + Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
```

---

### 4.8 Páginas: Home, Login, Register

Crea `src/pages/Home.jsx`:

```jsx
import { Link } from "react-router-dom";

const Home = () => (
  <div>
    {/* Hero */}
    <div
      className="py-5 text-center text-white"
      style={{ background: "linear-gradient(135deg, #3d2b1f 0%, #6f4e37 100%)" }}
    >
      <div className="container">
        <h1 className="display-4 fw-bold">☕ MktCafé</h1>
        <p className="lead">El marketplace de cafés de especialidad de Chile</p>
        <Link to="/tienda" className="btn btn-warning btn-lg me-3">
          Explorar Tienda
        </Link>
        <Link to="/register" className="btn btn-outline-light btn-lg">
          Vender mi Café
        </Link>
      </div>
    </div>

    {/* Sección de características */}
    <div className="container py-5">
      <div className="row g-4 text-center">
        <div className="col-md-4">
          <div className="p-4 border rounded">
            <div className="fs-1 mb-3">🌿</div>
            <h5>Cafés de Origen</h5>
            <p className="text-muted">
              Descubre cafés únicos de Colombia, Etiopía, Guatemala y más.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 border rounded">
            <div className="fs-1 mb-3">🛒</div>
            <h5>Compra Directo</h5>
            <p className="text-muted">
              Conecta directamente con tostadores y productores.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 border rounded">
            <div className="fs-1 mb-3">💚</div>
            <h5>Vende tu Café</h5>
            <p className="text-muted">
              Publica tus cafés y llega a compradores en todo Chile.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Home;
```

Crea `src/pages/Login.jsx`:

```jsx
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  // useForm: maneja los valores, validaciones y envío del formulario
  const {
    register,    // conecta cada input al formulario
    handleSubmit, // envuelve la función de submit con validación
    formState: { errors, isSubmitting }, // estado del formulario
  } = useForm();

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (success) navigate("/tienda");
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">☕ Ingresar</h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    {...register("email", {
                      required: "El email es obligatorio",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email inválido",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      minLength: { value: 6, message: "Mínimo 6 caracteres" },
                    })}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password.message}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Ingresando..." : "Ingresar"}
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                ¿No tienes cuenta?{" "}
                <Link to="/register">Regístrate aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

Crea `src/pages/Register.jsx`:

```jsx
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register: registerUser, error } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const success = await registerUser(data.nombre, data.email, data.password);
    if (success) navigate("/tienda");
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">☕ Crear cuenta</h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                    {...register("nombre", { required: "El nombre es obligatorio" })}
                  />
                  {errors.nombre && (
                    <div className="invalid-feedback">{errors.nombre.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    {...register("email", {
                      required: "El email es obligatorio",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email inválido",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      minLength: { value: 6, message: "Mínimo 6 caracteres" },
                    })}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                    {...register("confirmPassword", {
                      required: "Confirma tu contraseña",
                      validate: (value) =>
                        value === watch("password") || "Las contraseñas no coinciden",
                    })}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creando cuenta..." : "Registrarse"}
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                ¿Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

---

### 4.9 Páginas: Gallery y PublicationDetail

Crea `src/pages/Gallery.jsx`:

```jsx
import { useState, useEffect, useCallback } from "react";
import { getPublications } from "../services/publicationsService";
import ProductCard from "../components/ProductCard";

const TIPOS_MOLIENDA = ["", "Grano Entero", "Molienda Gruesa", "Molienda Media", "Molienda Fina", "Espresso"];

const Gallery = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoMolienda, setTipoMolienda] = useState("");

  // useCallback: memoriza la función para no recrearla en cada render
  // Solo se recrea cuando cambian search o tipoMolienda
  const fetchPublications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (tipoMolienda) params.tipo_molienda = tipoMolienda;
      const data = await getPublications(params);
      setPublications(data);
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [search, tipoMolienda]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  return (
    <div className="container py-4">
      <h2 className="mb-4">☕ Tienda</h2>

      {/* Filtros */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={tipoMolienda}
            onChange={(e) => setTipoMolienda(e.target.value)}
          >
            {TIPOS_MOLIENDA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo || "Todos los tipos"}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => { setSearch(""); setTipoMolienda(""); }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
        </div>
      ) : publications.length === 0 ? (
        <p className="text-center text-muted py-5">
          No se encontraron publicaciones.
        </p>
      ) : (
        <div className="row g-4">
          {publications.map((pub) => (
            <div key={pub.id} className="col-sm-6 col-md-4 col-lg-3">
              <ProductCard publication={pub} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
```

Crea `src/pages/PublicationDetail.jsx`:

```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicationById } from "../services/publicationsService";
import { useCart } from "../context/CartContext";

const PublicationDetail = () => {
  const { id } = useParams(); // obtener el :id de la URL
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPublicationById(id);
        setPublication(data);
      } catch {
        navigate("/tienda");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  );

  if (!publication) return null;

  const imageUrl = publication.imagen_url
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${publication.imagen_url}`
    : "https://via.placeholder.com/600x400?text=Sin+imagen";

  return (
    <div className="container py-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        ← Volver
      </button>
      <div className="row g-4">
        <div className="col-md-6">
          <img
            src={imageUrl}
            alt={publication.titulo}
            className="img-fluid rounded shadow"
            style={{ maxHeight: "400px", width: "100%", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-6">
          <h1 className="h2">{publication.titulo}</h1>
          <p className="text-muted">Por {publication.vendedor?.nombre}</p>

          <div className="row g-2 mb-3">
            {publication.origen_pais && (
              <div className="col-6">
                <small className="text-muted">🌍 Origen</small>
                <p className="mb-0 fw-semibold">
                  {publication.origen_pais}
                  {publication.origen_region && `, ${publication.origen_region}`}
                </p>
              </div>
            )}
            {publication.tipo_molienda && (
              <div className="col-6">
                <small className="text-muted">⚙️ Molienda</small>
                <p className="mb-0 fw-semibold">{publication.tipo_molienda}</p>
              </div>
            )}
            {publication.tipo_tueste && (
              <div className="col-6">
                <small className="text-muted">🔥 Tueste</small>
                <p className="mb-0 fw-semibold">{publication.tipo_tueste}</p>
              </div>
            )}
            <div className="col-6">
              <small className="text-muted">📦 Stock</small>
              <p className="mb-0 fw-semibold">{publication.stock} unidades</p>
            </div>
          </div>

          {publication.descripcion && (
            <p className="text-muted">{publication.descripcion}</p>
          )}

          <div className="d-flex align-items-center gap-3">
            <span className="fs-3 fw-bold text-success">
              ${Number(publication.precio).toLocaleString("es-CL")}
            </span>
            <button
              className="btn btn-warning btn-lg"
              onClick={() => addToCart(publication)}
              disabled={publication.stock === 0}
            >
              {publication.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetail;
```

---

### 4.10 Páginas: Profile y Orders

Crea `src/pages/Profile.jsx`:

```jsx
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Profile = () => {
  const { user, updateProfile, error } = useAuth();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      nombre: user?.nombre || "",
      bio: user?.bio || "",
      foto_url: user?.foto_url || "",
    },
  });

  const onSubmit = async (data) => {
    const ok = await updateProfile(data);
    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4">👤 Mi Perfil</h2>

          {success && <div className="alert alert-success">Perfil actualizado correctamente.</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="card p-4 shadow-sm">
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                {...register("nombre", { required: true })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Bio</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Cuéntanos sobre ti..."
                {...register("bio")}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">URL de foto de perfil</label>
              <input
                className="form-control"
                placeholder="https://..."
                {...register("foto_url")}
              />
            </div>
            <button
              type="submit"
              className="btn btn-warning w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
```

Crea `src/pages/Orders.jsx`:

```jsx
import { useState, useEffect } from "react";
import { getOrders } from "../services/publicationsService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">📦 Mis Pedidos</h2>

      {orders.length === 0 ? (
        <p className="text-muted">Todavía no tienes pedidos.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="card mb-3 shadow-sm">
            <div className="card-header d-flex justify-content-between">
              <span>Pedido #{order.id}</span>
              <span className={`badge ${order.estado === "pendiente" ? "bg-warning text-dark" : "bg-success"}`}>
                {order.estado}
              </span>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-2">
                {(order.items || []).map((item, i) => (
                  <li key={i} className="text-muted small">
                    {item.titulo} × {item.cantidad} — $
                    {Number(item.precio_unitario).toLocaleString("es-CL")}
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between">
                <small className="text-muted">
                  {new Date(order.created_at).toLocaleDateString("es-CL")}
                </small>
                <strong>
                  Total: ${Number(order.total).toLocaleString("es-CL")}
                </strong>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
```

---

### 4.11 Páginas: Mis Publicaciones, Crear y Editar

Crea `src/pages/MyPublications.jsx`:

```jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyPublications, deletePublication } from "../services/publicationsService";
import api from "../services/axiosConfig";
import ProductCard from "../components/ProductCard";

const MyPublications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMine = async () => {
    try {
      const data = await getMyPublications();
      setPublications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMine(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Pausar esta publicación?")) return;
    try {
      await deletePublication(id);
      fetchMine(); // recargar la lista
    } catch (err) {
      alert("Error al pausar la publicación");
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/publications/${id}/restore`);
      fetchMine();
    } catch (err) {
      alert("Error al reactivar la publicación");
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📋 Mis Publicaciones</h2>
        <Link to="/publicaciones/nueva" className="btn btn-warning">
          + Nueva publicación
        </Link>
      </div>

      {publications.length === 0 ? (
        <p className="text-muted">
          Todavía no tienes publicaciones.{" "}
          <Link to="/publicaciones/nueva">¡Crea la primera!</Link>
        </p>
      ) : (
        <div className="row g-4">
          {publications.map((pub) => (
            <div key={pub.id} className="col-sm-6 col-md-4 col-lg-3">
              <ProductCard
                publication={pub}
                showActions={true}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPublications;
```

Crea `src/pages/CreatePublication.jsx`:

```jsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createPublication } from "../services/publicationsService";

const TIPOS_MOLIENDA = ["Grano Entero", "Molienda Gruesa", "Molienda Media", "Molienda Fina", "Espresso"];
const TIPOS_TUESTE = ["Claro", "Tueste Medio", "Oscuro", "Tueste Italiano"];

const CreatePublication = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // FormData es necesario para enviar archivos junto con otros campos
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "imagen" && data.imagen[0]) {
          formData.append("imagen", data.imagen[0]);
        } else if (data[key]) {
          formData.append(key, data[key]);
        }
      });

      await createPublication(formData);
      navigate("/mis-publicaciones");
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear la publicación");
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <h2 className="mb-4">☕ Nueva Publicación</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="card p-4 shadow-sm">
            <div className="mb-3">
              <label className="form-label">Título *</label>
              <input
                className={`form-control ${errors.titulo ? "is-invalid" : ""}`}
                placeholder="Ej: Sidama Natural Etiopía"
                {...register("titulo", { required: "El título es obligatorio" })}
              />
              {errors.titulo && (
                <div className="invalid-feedback">{errors.titulo.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Notas de cata, proceso, etc."
                {...register("descripcion")}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Precio (CLP) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.precio ? "is-invalid" : ""}`}
                  min="1"
                  {...register("precio", {
                    required: "El precio es obligatorio",
                    min: { value: 1, message: "El precio debe ser mayor a 0" },
                  })}
                />
                {errors.precio && (
                  <div className="invalid-feedback">{errors.precio.message}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  defaultValue="0"
                  {...register("stock")}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Tipo de Molienda</label>
                <select className="form-select" {...register("tipo_molienda")}>
                  <option value="">— Seleccionar —</option>
                  {TIPOS_MOLIENDA.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Tipo de Tueste</label>
                <select className="form-select" {...register("tipo_tueste")}>
                  <option value="">— Seleccionar —</option>
                  {TIPOS_TUESTE.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">País de Origen</label>
                <input
                  className="form-control"
                  placeholder="Ej: Colombia"
                  {...register("origen_pais")}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Región</label>
                <input
                  className="form-control"
                  placeholder="Ej: Huila"
                  {...register("origen_region")}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Imagen del producto</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,image/webp"
                {...register("imagen")}
              />
              <small className="text-muted">JPG, PNG o WebP. Máximo 5MB.</small>
            </div>

            <div className="d-flex gap-3">
              <button
                type="submit"
                className="btn btn-warning flex-grow-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publicando..." : "Publicar"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/mis-publicaciones")}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePublication;
```

Crea `src/pages/EditPublication.jsx`:

```jsx
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { getPublicationById, updatePublication } from "../services/publicationsService";

const EditPublication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // Cargar datos actuales de la publicación para pre-llenar el formulario
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPublicationById(id);
        reset(data); // pre-llenar el formulario con los datos actuales
      } catch {
        navigate("/mis-publicaciones");
      }
    };
    fetch();
  }, [id, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      await updatePublication(id, {
        titulo: data.titulo,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock,
        tipo_molienda: data.tipo_molienda,
      });
      navigate("/mis-publicaciones");
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar");
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <h2 className="mb-4">✏️ Editar Publicación</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="card p-4 shadow-sm">
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input
                className={`form-control ${errors.titulo ? "is-invalid" : ""}`}
                {...register("titulo", { required: "Requerido" })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows={3} {...register("descripcion")} />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Precio (CLP)</label>
                <input
                  type="number"
                  className="form-control"
                  {...register("precio", { required: "Requerido", min: 1 })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Stock</label>
                <input type="number" className="form-control" min="0" {...register("stock")} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Tipo de Molienda</label>
              <select className="form-select" {...register("tipo_molienda")}>
                <option value="">— Seleccionar —</option>
                {["Grano Entero", "Molienda Gruesa", "Molienda Media", "Molienda Fina", "Espresso"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="d-flex gap-3">
              <button
                type="submit"
                className="btn btn-warning flex-grow-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/mis-publicaciones")}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPublication;
```

---

### 4.12 Página: Cart (Carrito + Checkout)

Crea `src/pages/Cart.jsx`:

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/publicationsService";

const Cart = () => {
  const { cart, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!direccion.trim()) {
      setError("La dirección de entrega es obligatoria.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createOrder({
        direccion,
        items: cart.map((item) => ({
          publication_id: item.id,
          cantidad: item.quantity,
        })),
      });
      clearCart();
      navigate("/pedidos");
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="fs-1 mb-3">🛒</div>
        <h3>Tu carrito está vacío</h3>
        <button className="btn btn-warning mt-3" onClick={() => navigate("/tienda")}>
          Ir a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">🛒 Carrito de Compras</h2>

      <div className="row g-4">
        {/* Lista de productos */}
        <div className="col-md-8">
          {cart.map((item) => (
            <div key={item.id} className="card mb-3 shadow-sm">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="flex-grow-1">
                  <h6 className="mb-0">{item.titulo}</h6>
                  <small className="text-muted">
                    ${Number(item.precio).toLocaleString("es-CL")} c/u
                  </small>
                </div>

                {/* Control de cantidad */}
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      item.quantity > 1
                        ? updateQuantity(item.id, item.quantity - 1)
                        : removeFromCart(item.id)
                    }
                  >
                    −
                  </button>
                  <span className="fw-bold">{item.quantity}</span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <span className="fw-bold text-success" style={{ minWidth: "80px", textAlign: "right" }}>
                  ${Number(item.precio * item.quantity).toLocaleString("es-CL")}
                </span>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeFromCart(item.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen y checkout */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>Resumen del pedido</h5>
            <hr />
            <div className="d-flex justify-content-between mb-3">
              <span>Total:</span>
              <strong className="text-success fs-5">
                ${Number(total).toLocaleString("es-CL")}
              </strong>
            </div>

            <div className="mb-3">
              <label className="form-label">Dirección de entrega</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Ingresa tu dirección..."
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>

            {error && <div className="alert alert-danger small">{error}</div>}

            <button
              className="btn btn-warning w-100 mb-2"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : isAuthenticated
                ? "Confirmar pedido"
                : "Ingresar para comprar"}
            </button>

            <button
              className="btn btn-outline-secondary w-100 btn-sm"
              onClick={clearCart}
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
```

---

### 4.13 Conectar todo en App.jsx

Primero, modifica `src/main.jsx` para importar Bootstrap:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Ahora crea `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Gallery from "./pages/Gallery";
import PublicationDetail from "./pages/PublicationDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import MyPublications from "./pages/MyPublications";
import CreatePublication from "./pages/CreatePublication";
import EditPublication from "./pages/EditPublication";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider y CartProvider envuelven toda la app para que
          cualquier componente pueda acceder al contexto */}
      <AuthProvider>
        <CartProvider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                {/* Rutas públicas — cualquiera puede acceder */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/tienda" element={<Gallery />} />
                <Route path="/publicaciones/:id" element={<PublicationDetail />} />
                <Route path="/carrito" element={<Cart />} />

                {/* Rutas privadas — solo usuarios autenticados */}
                <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/pedidos" element={<PrivateRoute><Orders /></PrivateRoute>} />
                <Route path="/mis-publicaciones" element={<PrivateRoute><MyPublications /></PrivateRoute>} />
                <Route path="/publicaciones/nueva" element={<PrivateRoute><CreatePublication /></PrivateRoute>} />
                <Route path="/publicaciones/:id/editar" element={<PrivateRoute><EditPublication /></PrivateRoute>} />

                {/* Cualquier ruta no definida redirige al Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

Agrega estilos globales en `src/index.css`:

```css
body {
  background-color: #fafafa;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
```

---

## 5. Ejecutar el proyecto completo

### Terminal 1 — Backend

```bash
cd mktcafe-backend
npm run dev
# ✅ Servidor corriendo en http://localhost:3000
```

### Terminal 2 — Frontend

```bash
cd mktcafe-frontend
npm run dev
# ✅ http://localhost:5173
```

Abre el navegador en `http://localhost:5173` y verás la app funcionando.

---

## ¿Qué hacer si algo no funciona?

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED 5432` | PostgreSQL no está corriendo. Inicia el servicio. |
| `password authentication failed` | Revisa la contraseña en `.env` |
| CORS error en el navegador | Verifica que el backend tenga `app.use(cors(...))` antes de las rutas |
| `Cannot read properties of undefined` | El componente intenta leer datos que aún no llegaron. Agrega un loading state. |
| Token inválido | El token expiró (24h). Cierra sesión y vuelve a ingresar. |
| `relation does not exist` | No ejecutaste el `schema.sql`. Ejecuta `psql -U postgres -d mktcafe -f db/schema.sql` |

---

## Flujo de aprendizaje recomendado

1. **Construye el backend primero** — prueba cada endpoint con Postman antes de tocar el frontend.
2. **Luego construye el frontend pantalla por pantalla** — empieza por Login y Register, luego Gallery, luego las páginas privadas.
3. **Entiende cada línea** — si copias código sin entenderlo, busca la parte que no entiendes y experimenta cambiándola.
4. **Usa console.log generosamente** — en el backend `console.log(req.body)` y en el frontend `console.log(data)` te dicen exactamente qué está pasando.

---

*Guía generada para el Proyecto Final MktCafé — Desafío Latam Full Stack + React*
