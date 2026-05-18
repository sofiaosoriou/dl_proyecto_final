# Hito 4 — Guía de Despliegue: MktCafé en Producción

**Stack:** React + Vite (Netlify) · Express (Render) · PostgreSQL (Neon)

---

## Resumen de arquitectura en producción

```
Usuario
  │
  ▼
Netlify  ──HTTPS──▶  Render (Express API)
                          │
                          ▼
                     Neon (PostgreSQL)
```

---

## Paso 1 — Deploy de la Base de Datos en Neon

### 1.1 Crear la base de datos

1. Ve a [neon.tech](https://neon.tech) → **Sign up** (gratuito).
2. Crea un nuevo **Project** → nombre: `mktcafe-db`.
3. Neon te entrega automáticamente:
   - `Connection string` (formato `postgresql://usuario:pass@host/dbname?sslmode=require`)
4. Copia la **connection string**, la necesitarás en el paso 2.

### 1.2 Crear las tablas (schema)

1. En el dashboard de Neon abre **SQL Editor**.
2. Pega el contenido completo de `Hito 3 - Desarrollo Backend/mktcafe-backend/db/schema.sql`.
3. Haz clic en **Run** → verifica que se crean las 5 tablas:
   - `users`, `publication`, `order`, `order_item`, `favorito`
4. Los datos de prueba (seed) también se insertan automáticamente.

---

## Paso 2 — Deploy del Backend en Render

### 2.1 Preparar el repositorio

Asegúrate de que el repositorio tiene estos archivos actualizados:

```
mktcafe-backend/
├── .gitignore          ← incluye node_modules/, .env, uploads/
├── .env.example        ← referencia de variables de entorno
├── render.yaml         ← configuración de Render (opcional)
├── db/config.js        ← soporta DATABASE_URL para cloud
└── index.js            ← CORS dinámico con FRONTEND_URL
```

Haz push a GitHub (rama `main` o `development`):

```bash
cd "Hito 3 - Desarrollo Backend/mktcafe-backend"
git add .
git commit -m "feat: configuración para deploy en Render"
git push origin main
```

### 2.2 Crear el Web Service en Render

1. Ve a [render.com](https://render.com) → **New → Web Service**.
2. Conecta tu repositorio de GitHub.
3. Configura:

| Campo | Valor |
|---|---|
| **Name** | `mktcafe-backend` |
| **Root Directory** | `Hito 3 - Desarrollo Backend/mktcafe-backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

4. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Connection string de Neon (del paso 1) |
| `JWT_SECRET` | Una cadena larga y segura (ej: `mktcafe2026_produccion_xyz...`) |
| `FRONTEND_URL` | *Lo completas después del paso 3* |
| `NODE_ENV` | `production` |

5. Haz clic en **Create Web Service**.
6. Espera que el build termine (~2 min). Copia la URL del servicio:
   - Ejemplo: `https://mktcafe-backend.onrender.com`

### 2.3 Verificar el backend

Abre en el navegador:

```
https://mktcafe-backend.onrender.com/
```

Debes ver la respuesta JSON:

```json
{
  "message": "API REST MktCafé funcionando correctamente ☕",
  "version": "1.0.0",
  "endpoints": [...]
}
```

---

## Paso 3 — Deploy del Frontend en Netlify

### 3.1 Preparar el repositorio

El frontend ya tiene los archivos necesarios:

```
mktcafe-frontend/
├── public/_redirects   ← SPA routing (evita 404 al recargar)
├── netlify.toml        ← configuración de build y redirects
└── .env.example        ← referencia de VITE_API_URL
```

### 3.2 Crear el site en Netlify

1. Ve a [netlify.com](https://netlify.com) → **Add new site → Import from Git**.
2. Conecta tu repositorio de GitHub.
3. Configura:

| Campo | Valor |
|---|---|
| **Base directory** | `Hito 2- Desarrollo Frontend/mktcafe-frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `Hito 2- Desarrollo Frontend/mktcafe-frontend/dist` |

4. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | URL del backend de Render + `/api`  (ej: `https://mktcafe-backend.onrender.com/api`) |

5. Haz clic en **Deploy site**.
6. Espera ~1 min. Copia la URL generada:
   - Ejemplo: `https://mktcafe.netlify.app`

---

## Paso 4 — Integración: conectar frontend con backend

### 4.1 Actualizar CORS en Render

Ahora que tienes la URL de Netlify, ve al dashboard de Render → **Environment** y actualiza:

| Variable | Valor |
|---|---|
| `FRONTEND_URL` | `https://mktcafe.netlify.app` *(URL exacta de Netlify)* |

Render redesplegará automáticamente.

### 4.2 Verificar la integración completa

Prueba cada funcionalidad desde el navegador en producción:

- [ ] **Registro** — crear una cuenta nueva → se guarda en Neon
- [ ] **Login** — iniciar sesión → recibe JWT
- [ ] **Galería** — carga publicaciones desde la API
- [ ] **Detalle de publicación** → datos reales de la DB
- [ ] **Crear publicación** (requiere login) → aparece en galería
- [ ] **Favoritos** → persiste en DB
- [ ] **Carrito + Pedido** → aparece en historial de pedidos

### 4.3 Verificar persistencia en Neon

1. Ve al SQL Editor de Neon.
2. Ejecuta:

```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
SELECT * FROM publication ORDER BY created_at DESC LIMIT 5;
SELECT * FROM "order" ORDER BY created_at DESC LIMIT 5;
```

Deben aparecer los datos creados desde la app en producción.

---

## Problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| CORS error en el navegador | `FRONTEND_URL` no está seteada o es incorrecta | Verificar la variable en Render, sin trailing slash |
| 404 al recargar una ruta en Netlify | Falta el archivo `_redirects` | El archivo `public/_redirects` ya está incluido |
| Las imágenes subidas no persisten | Render free tiene filesystem efímero | Para producción real usar Cloudinary o S3 |
| Backend tarda en responder la primera vez | Render free "duerme" tras 15 min de inactividad | Esperar ~30 seg o usar Render Cron para keepalive |
| `ssl: rejectUnauthorized` error | Neon requiere SSL | Ya resuelto en `db/config.js` |

---

## Tests del backend

Antes del deploy, verificar que todos los tests pasan:

```bash
cd "Hito 3 - Desarrollo Backend/mktcafe-backend"
npm run test
```

Grupos de tests cubiertos:

1. **Ruta raíz** — status 200, estructura de respuesta
2. **Rutas 404** — manejo de rutas inexistentes
3. **POST /api/login** — validación de campos obligatorios, token JWT
4. **POST /api/users** — validación de registro
5. **GET /api/publications** — ruta pública con filtros
6. **GET /api/publications/:id** — detalle e IDs inválidos
7. **Rutas protegidas** — middleware JWT (sin token, token inválido)
8. **Cabeceras HTTP** — Content-Type JSON en todas las respuestas

---

## Entregable final

La entrega del Hito 4 es el **link en producción de la aplicación cliente**:

```
https://mktcafe.netlify.app
```

*(reemplazar por la URL real generada por Netlify)*
