const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware de autenticación JWT.
 * Verifica que la petición incluya un token válido en la cabecera Authorization.
 * Si el token es válido, adjunta el payload decodificado en req.user y llama a next().
 * Si no, responde con 401.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: "Acceso denegado. Token no proporcionado." });
  }

  // El header puede venir como "Bearer <token>" o directamente "<token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto_dev");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};

module.exports = { verifyToken };
