# Script — Video Individual Hito 5
**MktCafé · Sofía Osorio · Desafío Latam Full Stack + React**
**Duración objetivo: 4 minutos** (habla tranquila, con pausas naturales)

---

> **Instrucciones antes de grabar:**
> - Abre la app corriendo en localhost:5173 para mostrarla mientras hablas
> - Graba pantalla + cámara si puedes (Loom lo hace en un clic)
> - El script está escrito para sonar natural — adáptalo con tus propias palabras
> - Los tiempos son orientativos

---

## ▶ INTRODUCCIÓN (0:00 – 0:20)

*[Muestra la pantalla de inicio de MktCafé]*

> "Hola, soy Sofía. Hoy les presento **MktCafé**, mi proyecto final del curso Full Stack + React de Desafío Latam.
> Es un marketplace de café de especialidad donde productores pueden publicar sus productos y compradores pueden descubrirlos y adquirirlos directamente.
> Les voy a contar qué problema resuelve, cómo lo construí, y qué aprendí en el camino."

---

## PARTE 1 — LA PROBLEMÁTICA (0:20 – 1:10) → **2 puntos**

*[Muestra la sección "Lo que ofrecemos" del Home]*

> "El problema que detecté es **la falta de un espacio digital especializado** para el café de especialidad en Chile.
>
> Por un lado, hay consumidores que quieren acceder a cafés de origen directo — con información real sobre el tueste, la molienda, el país y la región de cultivo — pero no saben dónde comprarlo más allá de grandes tiendas genéricas.
>
> Por otro lado, hay tostadores y productores artesanales pequeños que no tienen visibilidad en internet ni una plataforma diseñada para su nicho.
>
> La necesidad es clara: **conectar directamente a quien produce con quien consume**, en un espacio que hable el idioma del café de especialidad."

---

## PARTE 2 — CÓMO EL PROYECTO SATISFACE ESA NECESIDAD (1:10 – 2:30) → **4 puntos**

*[Demo en vivo: navega por la app mientras hablas]*

> "MktCafé responde a esa necesidad con tres pilares:"

**→ Mostrar la Tienda con filtros activos:**
> "Primero, **descubrimiento de productos**. La galería de la tienda permite filtrar por tipo de tueste —medio, italiano, claro— y por tipo de molienda —grano entero, molienda fina, espresso. También tiene búsqueda en tiempo real y ordenamiento por precio. El consumidor encuentra exactamente lo que busca."

**→ Ir a un detalle de producto:**
> "Segundo, **información completa**. Cada publicación muestra el nombre de la variedad, el origen del país y región, el perfil de sabor, el precio por 250g, el stock disponible y el nombre del vendedor. Puedes agregar al carrito, ajustar la cantidad y proceder al checkout."

**→ Ir a Crear Publicación (logueado):**
> "Tercero, **empoderamiento del vendedor**. Cualquier usuario registrado puede publicar su café con un formulario validado: nombre, precio, tipo de tueste, molienda, país de origen y descripción. Desde 'Mis Publicaciones' puede gestionar todo su catálogo."

> "Así MktCafé cumple la doble necesidad: el comprador encuentra café de calidad con información real, y el vendedor tiene visibilidad y un canal de ventas propio."

---

## PARTE 3 — CONOCIMIENTOS Y HABILIDADES DEL CURSO (2:30 – 3:15) → **2 puntos**

*[Puedes mostrar el código en el editor o quedarte en la app]*

> "Para construir esto apliqué los conocimientos de prácticamente todos los módulos del curso:"

> "**De React**: construí toda la interfaz con componentes funcionales y hooks. Usé `useState`, `useEffect`, `useCallback` para memoizar los filtros de la galería, y `useContext` para acceder al estado global desde cualquier componente."

> "**De manejo de estado global**: implementé dos Contexts propios — `AuthContext` para el usuario y el token JWT, y `CartContext` con `useReducer` para manejar todas las acciones del carrito de forma predecible."

> "**De routing**: configuré React Router v6 con rutas protegidas mediante un componente `PrivateRoute` que redirige al login si el usuario no está autenticado."

> "**De consumo de API**: usé Axios con una instancia configurada, interceptores de request para adjuntar el token automáticamente, y un interceptor de response que limpia la sesión ante un 401."

> "**De formularios**: todo formulario de la app usa `react-hook-form` con validación inline, mensajes de error y manejo del estado de envío."

---

## PARTE 4 — REFLEXIÓN LIBRE (3:15 – 4:00)

### a) Dificultades y cómo las resolví (0:30 → **0.5 pts**)

> "El mayor desafío técnico fue el manejo de re-renders en la galería. Al principio, los filtros se recalculaban en cada render aunque nada hubiera cambiado. La solución fue envolver la función `applyFilters` en `useCallback` con dependencias precisas, y llamarla desde un `useEffect`. Eso estabilizó el rendimiento completamente."

> "Otro reto fue la sincronización del carrito entre páginas. Lo resolví asegurándome de que `CartProvider` envolviera toda la app en el árbol de componentes, no solo las rutas del carrito."

---

### b) Lo que más disfruté (0:15 → **0.5 pts**)

> "Lo que más disfruté fue el proceso de diseño. Crear un sistema visual coherente desde cero —la paleta de colores café, la tipografía, los componentes CSS reutilizables— y ver que la app tenía una identidad propia me dio una satisfacción que el código solo no da."

---

### c) La metodología de aprendizaje (0:15 → **0.5 pts**)

> "La metodología de Desafío Latam de aprender haciendo fue clave. Cada hito del proyecto me obligó a aplicar lo aprendido de inmediato, con un objetivo concreto. Eso y el apoyo de los tutores cuando me trabé fue lo que me permitió llegar hasta acá con un producto real funcionando."

---

## ▶ CIERRE (4:00 – 4:10)

> "Eso es MktCafé. Del productor a tu taza. Muchas gracias."

---

## 📊 Checklist de puntaje

| Ítem | Pts | ✓ |
|------|-----|---|
| Problemática detectada + quién la tiene | 2 | ✅ Parte 1 |
| Cómo la app satisface la necesidad | 4 | ✅ Parte 2 |
| Conocimientos y habilidades del curso | 2 | ✅ Parte 3 |
| Dificultades y cómo las resolviste | 0.5 | ✅ Parte 4a |
| Lo que más disfrutaste | 0.5 | ✅ Parte 4b |
| Metodología de aprendizaje | 0.5 | ✅ Parte 4c |
| Video 3-5 minutos, individual | 0.5 | ✅ ~4 min |
| **TOTAL** | **10** | |

---

## ⏱ Control de tiempo (lectura normal ≈ 120 palabras/min)

| Segmento | Tiempo |
|----------|--------|
| Intro | 0:00 – 0:20 |
| Problemática | 0:20 – 1:10 |
| Solución (demo) | 1:10 – 2:30 |
| Habilidades | 2:30 – 3:15 |
| Reflexiones | 3:15 – 4:00 |
| Cierre | 4:00 – 4:10 |
| **Total** | **~4:10** |

---

## 💡 Tips para la grabación

- **Loom** (loom.com) graba pantalla + cámara gratis, sube automáticamente a la nube y te da link
- Sube a YouTube o Vimeo como **No listado** (solo quien tenga el link puede verlo)
- Ensaya 1-2 veces antes de grabar para que fluya natural
- No necesitas leer exactamente el script — úsalo como guía de puntos clave
- Mostrar la app funcionando en vivo suma mucho a la demostración
