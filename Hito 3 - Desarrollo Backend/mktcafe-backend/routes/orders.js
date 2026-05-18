const express = require("express");
const router = express.Router();
const pool = require("../db/config");
const { verifyToken } = require("../middleware/auth");

/**
 * POST /api/orders
 * Crear pedido desde el carrito (checkout). Requiere autenticación.
 * Body: { direccion: String, items: [{ publication_id, cantidad }] }
 */
router.post("/", verifyToken, async (req, res) => {
  const { direccion, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: "El carrito no puede estar vacío." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Calcular total consultando precios actuales
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
          error: `Publicación con id ${item.publication_id} no encontrada.`,
        });
      }

      const publication = pub.rows[0];

      if (publication.stock < item.cantidad) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Stock insuficiente para la publicación ${item.publication_id}.`,
        });
      }

      total += publication.precio * item.cantidad;
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

    // Crear los ítems del pedido y actualizar stock
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

    res.status(201).json({
      message: "Pedido creado",
      order,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear pedido:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    client.release();
  }
});

/**
 * GET /api/orders
 * Obtener historial de pedidos del usuario autenticado.
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total, o.estado, o.created_at,
              COUNT(oi.id)::int AS items_count
       FROM "order" o
       LEFT JOIN order_item oi ON o.id = oi.order_id
       WHERE o.buyer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener pedidos:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * GET /api/orders/:id
 * Obtener detalle de un pedido con sus ítems. Requiere autenticación.
 */
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await pool.query(
      `SELECT id, total, estado, direccion, created_at
       FROM "order"
       WHERE id = $1 AND buyer_id = $2`,
      [id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.publication_id, p.titulo, oi.cantidad, oi.precio_unitario
       FROM order_item oi
       JOIN publication p ON oi.publication_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.status(200).json({
      ...order,
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("Error al obtener detalle de pedido:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
