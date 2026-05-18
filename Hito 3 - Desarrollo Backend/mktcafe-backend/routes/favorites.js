const express = require("express");
const router = express.Router();
const pool = require("../db/config");
const { verifyToken } = require("../middleware/auth");

/**
 * GET /api/favorites
 * Obtener publicaciones favoritas del usuario autenticado.
 */
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
    console.error("Error al obtener favoritos:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * POST /api/favorites/:publication_id
 * Agregar publicación a favoritos.
 */
router.post("/:publication_id", verifyToken, async (req, res) => {
  const { publication_id } = req.params;

  try {
    // Verificar que la publicación existe
    const pub = await pool.query(
      "SELECT id FROM publication WHERE id = $1",
      [publication_id]
    );
    if (pub.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }

    const result = await pool.query(
      `INSERT INTO favorito (user_id, publication_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, publication_id) DO NOTHING
       RETURNING user_id, publication_id`,
      [req.user.id, publication_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(409)
        .json({ error: "La publicación ya está en tus favoritos." });
    }

    res.status(201).json({
      message: "Agregado a favoritos",
      favorite: result.rows[0],
    });
  } catch (error) {
    console.error("Error al agregar favorito:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * DELETE /api/favorites/:publication_id
 * Eliminar publicación de favoritos.
 */
router.delete("/:publication_id", verifyToken, async (req, res) => {
  const { publication_id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM favorito WHERE user_id = $1 AND publication_id = $2 RETURNING id",
      [req.user.id, publication_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "El favorito no existe." });
    }

    res.status(200).json({ message: "Eliminado de favoritos" });
  } catch (error) {
    console.error("Error al eliminar favorito:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
