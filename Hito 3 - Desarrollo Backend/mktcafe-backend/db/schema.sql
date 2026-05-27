-- ============================================================
--  MktCafé - Schema de Base de Datos
--  Hito 3 - Desarrollo Backend
-- ============================================================

-- Extensión para UUIDs (opcional, usamos SERIAL como PK)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Tabla de publicaciones (cafés)
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

-- Migración: agregar campo active si no existe (para bases de datos ya creadas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'publication' AND column_name = 'active'
  ) THEN
    ALTER TABLE publication ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS "order" (
  id          SERIAL PRIMARY KEY,
  buyer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total       NUMERIC(10, 2) NOT NULL,
  estado      VARCHAR(50) DEFAULT 'pendiente',
  direccion   TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabla de ítems de pedido
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

-- ============================================================
--  Datos de prueba (seed)
-- ============================================================

-- Insertar usuarios de prueba (passwords hasheados con bcrypt)
-- Password para ambos: "password123"
INSERT INTO users (nombre, email, password, bio) VALUES
  ('Ana García',  'ana@mktcafe.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amante del café de origen'),
  ('Carlos López','carlos@mktcafe.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Barista profesional')
ON CONFLICT (email) DO NOTHING;

-- Insertar publicaciones de prueba
-- tipo_molienda: 'Grano Entero' | 'Molienda Gruesa' | 'Molienda Media' | 'Molienda Fina' | 'Espresso'
-- tipo_tueste:   'Tueste Medio' | 'Tueste Italiano' | 'Claro' | 'Oscuro'
INSERT INTO publication (user_id, titulo, descripcion, precio, tipo_molienda, tipo_tueste, origen_pais, origen_region, stock) VALUES
  (1, 'Sidama Natural', 'Notas de arándano y chocolate negro. Proceso natural.', 12500, 'Grano Entero', 'Tueste Medio', 'Etiopía', 'Sidama', 50),
  (1, 'Colombia Huila Washed', 'Café de altura con acidez brillante y notas de frutas tropicales.', 11000, 'Molienda Fina', 'Claro', 'Colombia', 'Huila', 30),
  (2, 'Guatemala Antigua', 'Body achocolatado y acidez suave. Proceso lavado.', 9500, 'Grano Entero', 'Oscuro', 'Guatemala', 'Antigua', 20),
  (2, 'Peru Cajamarca', 'Notas de nuez y caramelo. Perfecto para espresso.', 10500, 'Espresso', 'Tueste Medio', 'Perú', 'Cajamarca', 15)
ON CONFLICT DO NOTHING;
