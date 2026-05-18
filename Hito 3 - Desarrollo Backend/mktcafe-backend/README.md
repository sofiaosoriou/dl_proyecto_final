# MktCafé — Backend API REST

Proyecto final Desafío Latam · Hito 3 — Desarrollo Backend

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor y API REST |
| PostgreSQL + pg | Base de datos relacional |
| bcryptjs | Hash seguro de contraseñas |
| jsonwebtoken | Autenticación JWT |
| cors | Solicitudes de origen cruzado |
| multer | Subida de imágenes |
| dotenv | Variables de entorno |
| Jest + supertest | Testing de rutas |

## Estructura del proyecto

```
mktcafe-backend/
├── index.js               ← Servidor principal (exportado para tests)
├── .env.example           ← Plantilla de variables de entorno
├── db/
│   ├── config.js          ← Pool de conexión PostgreSQL
│   └── schema.sql         ← Tablas y datos de prueba
├── middleware/
│   └── auth.js            ← Verificación de token JWT
├── routes/
│   ├── auth.js            ← POST /api/login
│   ├── users.js           ← CRUD de usuarios
│   ├── publications.js    ← CRUD de publicaciones
│   ├── favorites.js       ← Favoritos del usuario
│   └── orders.js          ← Pedidos / checkout
├── uploads/               ← Imágenes subidas (gitignore)
└── tests/
    └── api.spec.js        ← Tests con Jest + supertest
```

## Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus datos:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mktcafe
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=un_secreto_seguro
PORT=3000
```

### 3. Crear la base de datos en PostgreSQL

```bash
psql -U postgres -c "CREATE DATABASE mktcafe;"
psql -U postgres -d mktcafe -f db/schema.sql
```

### 4. Iniciar el servidor

```bash
npm run dev    # Desarrollo con nodemon
npm start      # Producción
```

## Endpoints de la API

### Autenticación
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | /api/login | Iniciar sesión → token JWT | ❌ |
| POST | /api/users | Registrar usuario | ❌ |
| GET | /api/users/:id | Perfil de usuario | ❌ |
| PUT | /api/users/:id | Actualizar perfil | ✅ |

### Publicaciones
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | /api/publications | Galería (con filtros) | ❌ |
| GET | /api/publications/:id | Detalle de publicación | ❌ |
| GET | /api/users/:id/publications | Mis publicaciones | ✅ |
| POST | /api/publications | Crear publicación | ✅ |
| PUT | /api/publications/:id | Editar publicación | ✅ |
| DELETE | /api/publications/:id | Eliminar publicación | ✅ |

### Favoritos y Pedidos
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | /api/favorites | Mis favoritos | ✅ |
| POST | /api/favorites/:id | Agregar favorito | ✅ |
| DELETE | /api/favorites/:id | Quitar favorito | ✅ |
| POST | /api/orders | Crear pedido (checkout) | ✅ |
| GET | /api/orders | Historial de pedidos | ✅ |
| GET | /api/orders/:id | Detalle de pedido | ✅ |

## Tests

```bash
npm run test
```

Los tests cubren 6 grupos de escenarios con Jest + supertest:
- Ruta raíz (200, tipo Object)
- Rutas no encontradas (404)
- Login con datos inválidos (400, 401)
- Registro con campos faltantes (400)
- Rutas públicas de publicaciones (200)
- Rutas protegidas sin token / token inválido (401)
