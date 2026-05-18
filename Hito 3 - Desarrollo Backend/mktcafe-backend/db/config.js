const { Pool } = require("pg");
require("dotenv").config();

// Render / Neon / Supabase entregan DATABASE_URL como connection string.
// En desarrollo local se usan las variables individuales DB_*.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // requerido por proveedores cloud
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "mktcafe",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
    });

pool.on("error", (err) => {
  console.error("Error inesperado en el cliente de PostgreSQL", err);
  process.exit(-1);
});

module.exports = pool;
