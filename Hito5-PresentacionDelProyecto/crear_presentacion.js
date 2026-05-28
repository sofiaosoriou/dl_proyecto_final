/**
 * MktCafé — Generador de Presentación Hito 5
 * ============================================
 * Diseño fiel al frontend: #111 / #fff / #fafafa, Georgia + Calibri,
 * labels uppercase con letter-spacing, divisores de 1px, sin color.
 *
 * Ejecutar:
 *   cd "Hito5-PresentacionDelProyecto"
 *   npm install pptxgenjs
 *   node crear_presentacion.js
 *
 * Genera: MktCafe_Hito5_Presentacion.pptx
 */

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout  = "LAYOUT_16x9";
pres.title   = "MktCafé — Presentación Final Hito 5";
pres.author  = "Sofía Osorio";

// ─── PALETA (idéntica al index.css) ─────────────────────────────────────────
const C = {
  dark:   "111111",   // #111  — hero, footer, secciones oscuras
  white:  "FFFFFF",   // #fff  — fondo claro
  fafa:   "FAFAFA",   // #fafafa — fondo alternativo
  f9:     "F9F9F9",   // #f9f9f9 — cart summary bg
  eee:    "EEEEEE",   // border
  ddd:    "DDDDDD",   // border claro
  bbb:    "BBBBBB",   // texto muted (tags, labels)
  "777":  "777777",   // texto secundario
  "555":  "555555",   // texto muted en oscuro
  "444":  "444444",   // border en oscuro
  "999":  "999999",   // nav links
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Label estilo .mk-section-tag / .mk-page-label */
function tag(slide, text, x, y, dark = false) {
  slide.addText(text, {
    x, y, w: 6, h: 0.22,
    fontSize: 7, bold: false, color: dark ? C["555"] : C.bbb,
    charSpacing: 4, fontFace: "Calibri", align: "left", valign: "middle", margin: 0,
  });
}

/** Divisor fino estilo .mk-section-div / .mk-page-div */
function divider(slide, x, y, w = 0.38, dark = false) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.008,
    fill: { color: dark ? C["444"] : C.dark },
    line: { color: dark ? C["444"] : C.dark, width: 0 },
  });
}

/** Título estilo Playfair Display → Georgia */
function title(slide, text, x, y, w, fontSize = 32, dark = false) {
  slide.addText(text, {
    x, y, w, h: fontSize / 72 * 1.4,
    fontSize, bold: true, color: dark ? C.white : C.dark,
    fontFace: "Georgia", align: "left", valign: "middle", margin: 0,
  });
}

/** Texto body estilo Inter → Calibri */
function body(slide, text, x, y, w, h, dark = false, size = 11) {
  slide.addText(text, {
    x, y, w, h,
    fontSize: size, color: dark ? C["555"] : C["777"],
    fontFace: "Calibri", align: "left", valign: "top", margin: 0,
    lineSpacingMultiple: 1.55,
  });
}

/** Tarjeta oscura sobre fondo negro (borde sutil) */
function darkCard(slide, x, y, w, h, label, heading, desc) {
  // borde delgado
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: "1A1A1A" },
    line: { color: C["444"], width: 0.5 },
  });
  // divisor top
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.007,
    fill: { color: C.white },
    line: { color: C.white, width: 0 },
  });
  slide.addText(label, {
    x: x + 0.18, y: y + 0.18, w: w - 0.36, h: 0.18,
    fontSize: 7, charSpacing: 3, color: C["555"], fontFace: "Calibri",
    align: "left", margin: 0,
  });
  slide.addText(heading, {
    x: x + 0.18, y: y + 0.44, w: w - 0.36, h: 0.4,
    fontSize: 13, bold: true, color: C.white, fontFace: "Georgia",
    align: "left", margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.18, y: y + 0.9, w: 0.24, h: 0.007,
    fill: { color: C["444"] },
    line: { color: C["444"], width: 0 },
  });
  slide.addText(desc, {
    x: x + 0.18, y: y + 1.04, w: w - 0.36, h: h - 1.2,
    fontSize: 9.5, color: C["555"], fontFace: "Calibri",
    align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.5,
  });
}

/** Tarjeta clara sobre fondo blanco */
function lightCard(slide, x, y, w, h, label, heading, desc) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.f9 },
    line: { color: C.eee, width: 0.5 },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.007,
    fill: { color: C.dark },
    line: { color: C.dark, width: 0 },
  });
  slide.addText(label, {
    x: x + 0.18, y: y + 0.18, w: w - 0.36, h: 0.18,
    fontSize: 7, charSpacing: 3, color: C.bbb, fontFace: "Calibri",
    align: "left", margin: 0,
  });
  slide.addText(heading, {
    x: x + 0.18, y: y + 0.44, w: w - 0.36, h: 0.4,
    fontSize: 13, bold: true, color: C.dark, fontFace: "Georgia",
    align: "left", margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.18, y: y + 0.9, w: 0.24, h: 0.007,
    fill: { color: C.eee },
    line: { color: C.eee, width: 0 },
  });
  slide.addText(desc, {
    x: x + 0.18, y: y + 1.04, w: w - 0.36, h: h - 1.2,
    fontSize: 9.5, color: C["777"], fontFace: "Calibri",
    align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.5,
  });
}

/** Paso numerado */
function step(slide, n, text, x, y, dark = false) {
  const numColor = dark ? C.dark  : C.white;
  const bgColor  = dark ? C.white : C.dark;
  const txtColor = dark ? C["777"] : C["555"];
  // número
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y: y + 0.04, w: 0.3, h: 0.3,
    fill: { color: bgColor },
    line: { color: bgColor, width: 0 },
  });
  slide.addText(String(n), {
    x, y: y + 0.04, w: 0.3, h: 0.3,
    fontSize: 9, bold: true, color: numColor, fontFace: "Georgia",
    align: "center", valign: "middle", margin: 0,
  });
  slide.addText(text, {
    x: x + 0.38, y, w: 3.8, h: 0.38,
    fontSize: 10, color: txtColor, fontFace: "Calibri",
    align: "left", valign: "middle", margin: 0,
  });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 1 — PORTADA  (oscuro, como .mk-hero)              ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  // Imagen de fondo semi-transparente (como hero background)
  s.addImage({
    path: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format",
    x: 0, y: 0, w: 10, h: 5.625,
    transparency: 88,
  });

  // Tag superior — igual a .mk-hero-tag
  s.addText("★   PROYECTO FINAL   ★", {
    x: 0.5, y: 1.1, w: 9, h: 0.26,
    fontSize: 8, color: C["555"], charSpacing: 5, fontFace: "Calibri",
    align: "center", margin: 0,
  });

  // Título principal — igual a .mk-hero-title (Playfair Display → Georgia)
  s.addText("MktCafé", {
    x: 0.5, y: 1.5, w: 9, h: 1.5,
    fontSize: 76, bold: true, color: C.white, fontFace: "Georgia",
    align: "center", valign: "middle", margin: 0,
    charSpacing: -3,
  });

  // Descripción — igual a .mk-hero-desc
  s.addText("Del productor a tu taza.", {
    x: 0.5, y: 3.1, w: 9, h: 0.4,
    fontSize: 14, color: C["777"], fontFace: "Calibri",
    align: "center", valign: "middle", margin: 0,
  });

  s.addText("Marketplace de café de especialidad · SPA Full Stack + React", {
    x: 0.5, y: 3.6, w: 9, h: 0.28,
    fontSize: 10, color: C["555"], fontFace: "Calibri", charSpacing: 1,
    align: "center", margin: 0,
  });

  // Footer — igual a .mk-footer
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.2, w: 10, h: 0.425,
    fill: { color: "0A0A0A" },
    line: { color: "0A0A0A", width: 0 },
  });
  s.addText("Sofía Osorio  ·  Desafío Latam Full Stack + React  ·  Hito 5 — Presentación del Proyecto", {
    x: 0.5, y: 5.23, w: 9, h: 0.28,
    fontSize: 8, color: C["444"], charSpacing: 1, fontFace: "Calibri",
    align: "center", margin: 0,
  });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 2 — EL PROBLEMA  (blanco, como .mk-section-white) ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  tag(s, "CONTEXTO · PROBLEMÁTICA", 0.55, 0.38);
  title(s, "¿Cuál es el problema?", 0.55, 0.64, 9);
  divider(s, 0.55, 1.2, 0.38);

  body(s,
    "Chile tiene una comunidad creciente de amantes del café de especialidad. Sin embargo, " +
    "no existe un espacio digital dedicado donde productores y tostadores artesanales puedan " +
    "vender directamente a consumidores finales, con información real y transparente.",
    0.55, 1.34, 4.2, 0.9,
  );

  // 3 tarjetas claras
  const needs = [
    { l: "CONSUMIDOR", h: "Acceso limitado",   d: "El comprador no sabe dónde adquirir café de origen con información real sobre tueste, molienda y región de cultivo." },
    { l: "VENDEDOR",   h: "Visibilidad nula",   d: "Productores y tostadores artesanales carecen de un canal de venta online propio adaptado a su nicho." },
    { l: "COMUNIDAD",  h: "Sin ecosistema",     d: "No hay plataforma que conecte a ambos actores en un espacio especializado en café de especialidad." },
  ];
  needs.forEach((n, i) => lightCard(s, 0.55 + i * 3.15, 2.36, 2.95, 2.88, n.l, n.h, n.d));
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 3 — LA SOLUCIÓN  (oscuro)                         ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addImage({
    path: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format",
    x: 5.5, y: 0, w: 4.5, h: 5.625,
    transparency: 82,
  });

  tag(s, "LA SOLUCIÓN", 0.55, 0.38, true);
  title(s, "MktCafé", 0.55, 0.64, 5, 52, true);

  s.addText("Un marketplace SPA donde tostadores\ny productores publican sus cafés\ny consumidores los descubren y compran.", {
    x: 0.55, y: 1.7, w: 4.7, h: 1.0,
    fontSize: 13, color: C["555"], fontFace: "Calibri",
    align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.6,
  });

  divider(s, 0.55, 2.86, 0.38, true);

  // Stats estilo .mk-stat
  const stats = [
    { n: "2",    u: "ROLES",      d: "Comprador y Vendedor" },
    { n: "8+",   u: "PANTALLAS",  d: "Flujo UX completo" },
    { n: "SPA",  u: "REACT",      d: "Vite + Router v6" },
  ];
  stats.forEach((st, i) => {
    const x = 0.55 + i * 2.9;
    s.addText(st.n, {
      x, y: 3.1, w: 2.8, h: 0.82,
      fontSize: 46, bold: true, color: C.white, fontFace: "Georgia",
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.u, {
      x, y: 4.0, w: 2.8, h: 0.24,
      fontSize: 7.5, bold: true, color: C.white, charSpacing: 3, fontFace: "Calibri",
      align: "left", margin: 0,
    });
    s.addText(st.d, {
      x, y: 4.26, w: 2.8, h: 0.22,
      fontSize: 9, color: C["555"], fontFace: "Calibri",
      align: "left", margin: 0,
    });
    if (i < 2) {
      slide_vline(s, x + 2.5, 3.1, 1.38);
    }
  });

  function slide_vline(s, x, y, h) {
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.007, h,
      fill: { color: C["444"] },
      line: { color: C["444"], width: 0 },
    });
  }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 4 — DEMO: COMPRADOR  (blanco)                     ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  tag(s, "DEMO · EXPERIENCIA DE USUARIO", 0.55, 0.38);
  title(s, "Flujo del Comprador", 0.55, 0.64, 9);
  divider(s, 0.55, 1.2, 0.38);

  // Pasos
  const steps = [
    [1, "Home — Ver cafés destacados y acceder a la tienda"],
    [2, "Tienda — Buscar, filtrar por tueste y molienda, ordenar por precio"],
    [3, "Detalle — Ver descripción, origen, stock y perfil del vendedor"],
    [4, "Carrito — Ajustar cantidades, revisar subtotal + envío ($3.000)"],
    [5, "Checkout — Confirmar orden (requiere sesión activa)"],
  ];
  steps.forEach(([n, lbl], i) => step(s, n, lbl, 0.55, 1.46 + i * 0.6, false));

  // Panel derecho — estilo .mk-cart-summary / .mk-seller-table
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.38, y: 1.14, w: 4.35, h: 4.12,
    fill: { color: C.f9 },
    line: { color: C.eee, width: 0.5 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.38, y: 1.14, w: 4.35, h: 0.007,
    fill: { color: C.dark },
    line: { color: C.dark, width: 0 },
  });

  s.addText("FUNCIONALIDADES CLAVE", {
    x: 5.58, y: 1.26, w: 3.95, h: 0.22,
    fontSize: 7, charSpacing: 3, color: C.bbb, fontFace: "Calibri",
    align: "left", margin: 0,
  });

  const feats = [
    "Búsqueda en tiempo real (nombre, descripción, origen)",
    "Filtro por tueste: Medio · Italiano · Claro · Oscuro",
    "Filtro por molienda: Grano entero, Media, Fina, Gruesa",
    "Pills de categoría para filtrado rápido",
    "Ordenamiento: más reciente / precio asc / precio desc",
    "Carrito persistente con Context API + useReducer",
    "Checkout conectado a API REST de órdenes",
  ];
  feats.forEach((f, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.58, y: 1.62 + i * 0.48, w: 3.95, h: 0.007,
      fill: { color: C.eee },
      line: { color: C.eee, width: 0 },
    });
    s.addText("— " + f, {
      x: 5.58, y: 1.68 + i * 0.48, w: 3.95, h: 0.38,
      fontSize: 9, color: C["777"], fontFace: "Calibri",
      align: "left", valign: "middle", margin: 0,
    });
  });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 5 — DEMO: VENDEDOR  (oscuro)                      ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  tag(s, "DEMO · ROL VENDEDOR", 0.55, 0.38, true);
  title(s, "Flujo del Vendedor", 0.55, 0.64, 9, 32, true);
  divider(s, 0.55, 1.2, 0.38, true);

  const steps = [
    [1, "Registro — Crear cuenta con email y contraseña"],
    [2, "Login — Autenticación JWT con token persistido en localStorage"],
    [3, "Publicar — Formulario validado: nombre, precio, tueste, molienda, origen, stock"],
    [4, "Mis publicaciones — Ver, editar o eliminar productos propios"],
    [5, "Perfil — Editar datos personales de la cuenta"],
  ];
  steps.forEach(([n, lbl], i) => step(s, n, lbl, 0.55, 1.46 + i * 0.6, true));

  // Panel derecho — rutas privadas
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.38, y: 1.14, w: 4.35, h: 4.12,
    fill: { color: "1A1A1A" },
    line: { color: C["444"], width: 0.5 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.38, y: 1.14, w: 4.35, h: 0.007,
    fill: { color: C.white },
    line: { color: C.white, width: 0 },
  });
  s.addText("RUTAS PROTEGIDAS · PRIVATEROUTE", {
    x: 5.58, y: 1.26, w: 3.95, h: 0.22,
    fontSize: 7, charSpacing: 3, color: C["555"], fontFace: "Calibri",
    align: "left", margin: 0,
  });

  const routes = [
    { r: "/perfil",              d: "Editar perfil de usuario" },
    { r: "/pedidos",             d: "Historial de órdenes de compra" },
    { r: "/mis-publicaciones",   d: "Gestión del catálogo propio" },
    { r: "/publicaciones/nueva", d: "Crear nueva publicación" },
  ];
  routes.forEach((rt, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.58, y: 1.62 + i * 0.84, w: 3.95, h: 0.74,
      fill: { color: "222222" },
      line: { color: C["444"], width: 0.5 },
    });
    s.addText(rt.r, {
      x: 5.76, y: 1.72 + i * 0.84, w: 3.6, h: 0.26,
      fontSize: 10, bold: true, color: C.white, fontFace: "Consolas",
      align: "left", margin: 0,
    });
    s.addText(rt.d, {
      x: 5.76, y: 1.98 + i * 0.84, w: 3.6, h: 0.22,
      fontSize: 9, color: C["555"], fontFace: "Calibri",
      align: "left", margin: 0,
    });
  });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 6 — STACK TÉCNICO  (blanco)                       ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  tag(s, "TECNOLOGÍA · STACK TÉCNICO", 0.55, 0.38);
  title(s, "Stack Técnico", 0.55, 0.64, 9);
  divider(s, 0.55, 1.2, 0.38);

  const tech = [
    { e: "⚛️",  t: "React 18",        d: "Componentes funcionales con hooks. Sin clases en toda la app." },
    { e: "⚡",  t: "Vite",            d: "Build tool. Dev server ultrarrápido con HMR." },
    { e: "🔀",  t: "React Router v6", d: "Rutas anidadas y rutas protegidas con PrivateRoute." },
    { e: "🌐",  t: "Context API",     d: "AuthContext (JWT + usuario) y CartContext (useReducer)." },
    { e: "📡",  t: "Axios",           d: "Instancia con interceptores para JWT y manejo de 401." },
    { e: "📝",  t: "react-hook-form", d: "Validación de formularios con errores en tiempo real." },
    { e: "🎨",  t: "Bootstrap 5",     d: "Grid responsive + sistema de diseño CSS propio." },
    { e: "🔒",  t: "JWT Auth",        d: "Token persistido en localStorage con logout automático en 401." },
  ];

  const cols = 4;
  tech.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.55 + col * 2.36;
    const y = 1.46 + row * 1.9;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.2, h: 1.76,
      fill: { color: C.f9 },
      line: { color: C.eee, width: 0.5 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.2, h: 0.007,
      fill: { color: C.dark },
      line: { color: C.dark, width: 0 },
    });
    s.addText(t.e, {
      x: x + 0.14, y: y + 0.14, w: 0.5, h: 0.46,
      fontSize: 22, align: "left", valign: "middle", margin: 0,
    });
    s.addText(t.t, {
      x: x + 0.14, y: y + 0.66, w: 1.9, h: 0.28,
      fontSize: 11, bold: true, color: C.dark, fontFace: "Georgia",
      align: "left", margin: 0,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.14, y: y + 0.98, w: 1.9, h: 0.007,
      fill: { color: C.eee },
      line: { color: C.eee, width: 0 },
    });
    s.addText(t.d, {
      x: x + 0.14, y: y + 1.06, w: 1.9, h: 0.6,
      fontSize: 8.5, color: C["777"], fontFace: "Calibri",
      align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.4,
    });
  });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 7 — ARQUITECTURA  (oscuro)                        ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  tag(s, "ARQUITECTURA · FRONTEND SPA", 0.55, 0.38, true);
  title(s, "Arquitectura de la Aplicación", 0.55, 0.64, 9, 28, true);
  divider(s, 0.55, 1.16, 0.38, true);

  // Capas del sistema — inspiradas en la estructura real del código
  const layers = [
    {
      n: "5",
      l: "VISTA — Pages + Components",
      d: "Home · Tienda · Detalle · Carrito · Perfil · Pedidos · Mis Publicaciones · Nueva Publicación",
      bg: "1F1F1F", border: C["444"],
    },
    {
      n: "4",
      l: "ENRUTAMIENTO — React Router v6",
      d: "BrowserRouter · Routes · PrivateRoute (redirige a /login si el usuario no está autenticado)",
      bg: "1A1A1A", border: C["444"],
    },
    {
      n: "3",
      l: "ESTADO GLOBAL — Context API",
      d: "AuthContext (user + token JWT)  ·  CartContext (useReducer: ADD_ITEM / REMOVE_ITEM / UPDATE_QUANTITY / CLEAR_CART)",
      bg: "161616", border: C["444"],
    },
    {
      n: "2",
      l: "SERVICIOS — Axios",
      d: "axiosConfig.js · authService.js · publicationsService.js  |  Interceptor JWT en request · Handler 401 en response",
      bg: "121212", border: C["444"],
    },
    {
      n: "1",
      l: "API REST — Backend",
      d: "VITE_API_URL = http://localhost:3000/api  |  Authorization: Bearer <token>  |  Fallback a datos estáticos si falla",
      bg: "0D0D0D", border: "555555",
    },
  ];

  layers.forEach((l, i) => {
    const y = 1.38 + i * 0.8;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55, y, w: 9.1, h: 0.72,
      fill: { color: l.bg },
      line: { color: l.border, width: 0.5 },
    });
    // Badge número
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55, y, w: 0.34, h: 0.72,
      fill: { color: C.white },
      line: { color: C.white, width: 0 },
    });
    s.addText(l.n, {
      x: 0.55, y, w: 0.34, h: 0.72,
      fontSize: 11, bold: true, color: C.dark, fontFace: "Georgia",
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(l.l, {
      x: 1.02, y: y + 0.06, w: 8, h: 0.24,
      fontSize: 9, bold: true, color: C.white, charSpacing: 2, fontFace: "Calibri",
      align: "left", margin: 0,
    });
    s.addText(l.d, {
      x: 1.02, y: y + 0.34, w: 8.1, h: 0.3,
      fontSize: 8.5, color: C["555"], fontFace: "Calibri",
      align: "left", margin: 0,
    });
  });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 8 — MOMENTOS DESTACADOS  (blanco)                 ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  tag(s, "DESARROLLO · MOMENTOS DESTACADOS", 0.55, 0.38);
  title(s, "Lo mejor del proceso", 0.55, 0.64, 9);
  divider(s, 0.55, 1.2, 0.38);

  const hi = [
    {
      l: "DISEÑO",
      h: "Sistema visual propio",
      d: "Construir el sistema de diseño desde cero —paleta monocromática, tipografía editorial Playfair Display, componentes CSS reutilizables— fue el momento en que el proyecto cobró identidad propia.",
    },
    {
      l: "AUTENTICACIÓN",
      h: "Flujo JWT completo",
      d: "Implementar AuthContext + interceptores Axios + PrivateRoute funcionando en conjunto fue el logro técnico más satisfactorio. Ver el 401 redirigir automáticamente al login fue el momento 'eureka'.",
    },
    {
      l: "ESTADO",
      h: "CartContext con useReducer",
      d: "Diseñar el reducer del carrito con ADD, REMOVE, UPDATE y CLEAR de forma predecible fue el reto que más enseñó sobre arquitectura de estado. El patrón es escalable y fácil de testear.",
    },
  ];
  hi.forEach((h, i) => lightCard(s, 0.55 + i * 3.15, 1.48, 2.95, 3.76, h.l, h.h, h.d));
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 9 — DESAFÍOS  (oscuro)                            ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  tag(s, "REFLEXIÓN · DESAFÍOS Y SOLUCIONES", 0.55, 0.38, true);
  title(s, "Dificultades que resolvimos", 0.55, 0.64, 9, 28, true);
  divider(s, 0.55, 1.16, 0.38, true);

  const ch = [
    {
      l: "PERFORMANCE",
      h: "Re-renders en la Galería",
      d: "Los filtros se ejecutaban en cada render aunque nada hubiera cambiado.\n\nSolución: useCallback para memoizar applyFilters + useEffect con dependencias exactas.",
    },
    {
      l: "ESTADO",
      h: "Carrito entre rutas",
      d: "Al navegar el carrito parecía resetearse.\n\nSolución: CartProvider debe envolver toda la app en el árbol de componentes, no solo una sección.",
    },
    {
      l: "RESILIENCIA",
      h: "API no disponible",
      d: "Sin backend activo la app quedaba en blanco.\n\nSolución: bloque catch en cada fetch con datos estáticos SAMPLE_PUBLICATIONS como fallback.",
    },
  ];
  ch.forEach((c, i) => darkCard(s, 0.55 + i * 3.15, 1.48, 2.95, 3.76, c.l, c.h, c.d));
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE 10 — CIERRE  (oscuro, como hero)                  ║
// ╚══════════════════════════════════════════════════════════╝
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addImage({
    path: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200&auto=format",
    x: 0, y: 0, w: 10, h: 5.625,
    transparency: 90,
  });

  // Quote estilo .mk-quote
  s.addText('"El café no es solo una bebida,\nes un puente entre culturas,\npersonas y momentos únicos."', {
    x: 1.5, y: 0.9, w: 7, h: 1.8,
    fontSize: 20, italic: true, color: C.white, fontFace: "Georgia",
    align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.6,
  });

  s.addText("— MktCafé", {
    x: 1.5, y: 2.82, w: 7, h: 0.3,
    fontSize: 9, color: C["555"], charSpacing: 2, fontFace: "Calibri",
    align: "center", margin: 0,
  });

  divider(s, 4.1, 3.28, 1.8, true);

  s.addText("Gracias.", {
    x: 1.5, y: 3.5, w: 7, h: 0.88,
    fontSize: 56, bold: true, color: C.white, fontFace: "Georgia",
    align: "center", valign: "middle", margin: 0,
  });

  // Footer igual a portada
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.2, w: 10, h: 0.425,
    fill: { color: "0A0A0A" },
    line: { color: "0A0A0A", width: 0 },
  });
  s.addText("Sofía Osorio  ·  Full Stack + React  ·  Desafío Latam  ·  2025", {
    x: 0.5, y: 5.23, w: 9, h: 0.28,
    fontSize: 8, color: C["444"], charSpacing: 1, fontFace: "Calibri",
    align: "center", margin: 0,
  });
}

// ─── GUARDAR ─────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "MktCafe_Hito5_Presentacion.pptx" })
  .then(() => console.log("✅  Archivo generado: MktCafe_Hito5_Presentacion.pptx"))
  .catch((err) => console.error("❌  Error:", err));
