const express = require("express");
const router = express.Router();
const pool = require("../db/config");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValid = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * GET /api/publications
 * Obtener todas las publicaciones con filtros opcionales.
 * Query params: tipo_molienda, search, page, limit
 */
router.get("/", async (req, res) => {
  const { tipo_molienda, search, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT p.id, p.titulo, p.precio, p.tipo_molienda, p.origen_pais, p.imagen_url,
           json_build_object('id', u.id, 'nombre', u.nombre) AS vendedor
    FROM publication p
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (tipo_molienda) {
    query += ` AND p.tipo_molienda = $${paramIndex++}`;
    params.push(tipo_molienda);
  }

  if (search) {
    query += ` AND (p.titulo ILIKE $${paramIndex} OR p.origen_pais ILIKE $${paramIndex} OR p.origen_region ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(parseInt(limit), offset);

  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener publicaciones:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * GET /publications/mine
 * Obtener publicaciones propias del usuario autenticado.
 */
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, titulo, precio, stock, imagen_url, created_at
       FROM publication
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener publicaciones propias:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * GET /api/publications/:id
 * Obtener detalle de una publicación.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.id, p.titulo, p.descripcion, p.precio, p.tipo_molienda, p.tipo_tueste,
              p.origen_pais, p.origen_region, p.imagen_url, p.stock, p.created_at,
              json_build_object('id', u.id, 'nombre', u.nombre, 'foto_url', u.foto_url) AS vendedor
       FROM publication p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener publicación:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * POST /api/publications
 * Crear nueva publicación. Requiere autenticación.
 */
router.post("/", verifyToken, upload.single("imagen"), async (req, res) => {
  const {
    titulo,
    descripcion,
    precio,
    tipo_molienda,
    tipo_tueste,
    origen_pais,
    origen_region,
    stock,
  } = req.body;

  if (!titulo || !precio) {
    return res
      .status(400)
      .json({ error: "Título y precio son obligatorios." });
  }

  const imagen_url = req.file
    ? `/uploads/${req.file.filename}`
    : null;

  try {
    const result = await pool.query(
      `INSERT INTO publication
         (user_id, titulo, descripcion, precio, tipo_molienda, tipo_tueste,
          origen_pais, origen_region, stock, imagen_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, titulo, precio, user_id`,
      [
        req.user.id,
        titulo,
        descripcion || null,
        parseFloat(precio),
        tipo_molienda || null,
        tipo_tueste || null,
        origen_pais || null,
        origen_region || null,
        parseInt(stock) || 0,
        imagen_url,
      ]
    );

    res.status(201).json({
      message: "Publicación creada",
      publication: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear publicación:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * PUT /api/publications/:id
 * Editar publicación propia. Requiere autenticación.
 */
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, precio, stock, tipo_molienda } = req.body;

  try {
    // Verificar que la publicación existe y pertenece al usuario
    const check = await pool.query(
      "SELECT user_id FROM publication WHERE id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }

    if (check.rows[0].user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para editar esta publicación." });
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
      [
        titulo || null,
        descripcion || null,
        precio ? parseFloat(precio) : null,
        stock !== undefined ? parseInt(stock) : null,
        tipo_molienda || null,
        id,
      ]
    );

    res.status(200).json({
      message: "Publicación actualizada",
      publication: result.rows[0],
    });
  } catch (error) {
    console.error("Error al editar publicación:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * DELETE /api/publications/:id
 * Eliminar publicación propia. Requiere autenticación.
 */
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      "SELECT user_id FROM publication WHERE id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }

    if (check.rows[0].user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar esta publicación." });
    }

    await pool.query("DELETE FROM publication WHERE id = $1", [id]);

    res.status(200).json({ message: "Publicación eliminada" });
  } catch (error) {
    console.error("Error al eliminar publicación:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
