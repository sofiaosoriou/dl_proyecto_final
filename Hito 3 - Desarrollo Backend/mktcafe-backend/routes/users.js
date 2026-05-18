const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../db/config");
const { verifyToken } = require("../middleware/auth");

/**
 * POST /api/users
 * Registrar nuevo usuario.
 */
router.post("/", async (req, res) => {
  const { nombre, email, password, foto_url } = req.body;

  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ error: "Nombre, email y contraseña son obligatorios." });
  }

  try {
    // Verificar si el email ya está registrado
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (nombre, email, password, foto_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email`,
      [nombre, email, hashedPassword, foto_url || null]
    );

    res.status(201).json({
      message: "Usuario creado",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * GET /api/users/:id
 * Obtener perfil de un usuario.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, nombre, email, bio, foto_url, created_at FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * PUT /api/users/:id
 * Actualizar perfil del usuario autenticado.
 * Requiere token JWT; solo puede modificar su propio perfil.
 */
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, bio, foto_url } = req.body;

  // Verificar que el usuario solo modifica su propio perfil
  if (parseInt(id) !== req.user.id) {
    return res
      .status(403)
      .json({ error: "No tienes permiso para modificar este perfil." });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET nombre = COALESCE($1, nombre),
           bio = COALESCE($2, bio),
           foto_url = COALESCE($3, foto_url)
       WHERE id = $4
       RETURNING id, nombre, bio, foto_url`,
      [nombre || null, bio || null, foto_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json({
      message: "Perfil actualizado",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * GET /api/users/:id/publications
 * Obtener publicaciones propias del usuario autenticado.
 */
router.get("/:id/publications", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, titulo, precio, stock, created_at
       FROM publication
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener publicaciones del usuario:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
