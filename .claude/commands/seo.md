---
name: seo
description: Audita y mejora el SEO del proyecto MktCafé. Revisa index.html, meta tags por página, Open Graph, accesibilidad semántica e instala react-helmet-async si es necesario.
---

Eres un experto en SEO para SPAs React/Vite. Tu tarea es auditar y mejorar el SEO del proyecto MktCafé ubicado en `Hito 2- Desarrollo Frontend/mktcafe-frontend/`.

## Pasos obligatorios (en orden)

### 1. Auditoría — lee estos archivos antes de tocar nada

- `index.html` — meta tags base actuales
- `src/App.jsx` — rutas definidas
- `src/pages/*.jsx` — todas las páginas (título, descripción, contenido semántico)
- `public/` — verifica si existen `robots.txt`, `sitemap.xml`, `favicon.svg`
- `package.json` — si `react-helmet-async` ya está instalado

### 2. Diagnóstico — reporta lo que falta

Muestra una tabla con el estado actual de cada ítem:

| Ítem | Estado | Prioridad |
|------|--------|-----------|
| `<meta name="description">` global | ✅/❌ | Alta |
| Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) | ✅/❌ | Alta |
| Twitter Card | ✅/❌ | Media |
| `<title>` dinámico por página | ✅/❌ | Alta |
| `robots.txt` | ✅/❌ | Media |
| `sitemap.xml` | ✅/❌ | Baja |
| HTML semántico (`<main>`, `<article>`, `<section>`) | ✅/❌ | Media |
| Atributos `alt` en imágenes | ✅/❌ | Alta |
| `lang="es"` en `<html>` | ✅/❌ | Alta |
| Canonical URL | ✅/❌ | Media |

### 3. Implementación — solo si el usuario aprueba el diagnóstico

Aplica las mejoras en este orden de prioridad:

#### A. Meta tags base en `index.html`
Agrega dentro de `<head>` los tags que falten:
```html
<meta name="description" content="MktCafé — Descubre y compra café de especialidad directamente de tostadores artesanales." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://mktcafe.cl" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="MktCafé" />
<meta property="og:title" content="MktCafé — Marketplace de café de especialidad" />
<meta property="og:description" content="Descubre y compra café de especialidad directamente de tostadores artesanales." />
<meta property="og:image" content="/og-image.jpg" />
<meta property="og:url" content="https://mktcafe.cl" />
<meta property="og:locale" content="es_CL" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="MktCafé — Marketplace de café de especialidad" />
<meta name="twitter:description" content="Descubre y compra café de especialidad directamente de tostadores artesanales." />
<meta name="twitter:image" content="/og-image.jpg" />
```

#### B. Títulos dinámicos por página con react-helmet-async

Si no está instalado, indica al usuario que ejecute:
```
! npm install react-helmet-async
```
Luego espera confirmación antes de continuar.

Envuelve el router en `App.jsx` con `<HelmetProvider>` y agrega `<Helmet>` en cada página con título y descripción únicos:

| Página | `<title>` sugerido | `description` sugerida |
|--------|--------------------|------------------------|
| Home | MktCafé — Café de especialidad | Marketplace de café artesanal |
| Gallery | Explorar cafés — MktCafé | Filtra y descubre granos de todo el mundo |
| PublicationDetail | `{nombre del producto}` — MktCafé | Dinámico desde los datos del producto |
| Login | Iniciar sesión — MktCafé | Accede a tu cuenta |
| Register | Crear cuenta — MktCafé | Únete a la comunidad cafetera |
| Profile | Mi perfil — MktCafé | Gestiona tu cuenta |
| Cart | Mi carrito — MktCafé | Revisa y finaliza tu compra |
| Orders | Mis pedidos — MktCafé | Historial de compras |
| MyPublications | Mis publicaciones — MktCafé | Gestiona tus cafés en venta |
| CreatePublication | Nueva publicación — MktCafé | Vende tu café en MktCafé |

#### C. HTML semántico
En las páginas que usen solo `<div>`, reemplaza el contenedor principal por `<main>` y usa `<article>` para tarjetas de producto.

#### D. Archivos estáticos en `public/`

Crea `public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /profile
Disallow: /orders
Disallow: /my-publications
Disallow: /create-publication

Sitemap: https://mktcafe.cl/sitemap.xml
```

Si el usuario tiene dominio definitivo, crea también `public/sitemap.xml` con las rutas públicas.

### 4. Resumen final

Al terminar, muestra:
- Qué archivos se modificaron
- Qué queda pendiente (og:image real, dominio definitivo para canonical/sitemap)
- Comando para verificar en producción: `npm run build && npm run preview`

## Restricciones

- No instales dependencias sin avisar primero al usuario.
- No modifiques lógica de negocio ni estilos mientras haces SEO.
- Si una página carga datos de API (como `PublicationDetail`), el `<Helmet>` debe usar los datos del estado, no texto hardcodeado.
- Usa `react-helmet-async`, no `react-helmet` (este último tiene problemas con React 18+).
