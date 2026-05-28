---
name: Estado del proyecto MktCafé
description: Diagnóstico del estado actual del frontend y backend tras auditoría completa (2026-05-26)
type: project
---

Auditoría completa realizada el 2026-05-26. Puntos clave:

- Frontend activo en `Hito2-Frontend/mktcafe-frontend/`
- Backend activo en `Hito 3 - Desarrollo Backend/mktcafe-backend/`
- react-icons NO está instalado (solo axios, bootstrap, react, react-dom, react-hook-form, react-router-dom)
- La tabla `publication` en PostgreSQL NO tiene campo `active`/`isActive` — el DELETE es físico
- El frontend llama `getMyPublications()` → GET `/publications/mine`, pero el backend retorna array plano sin wrapper `{ publications: [] }`, mientras el frontend hace `data.publications || data` — funciona pero inconsistente con el GET general
- `addFavorite`/`removeFavorite` están definidos en publicationsService.js pero NINGÚN componente los llama — el botón "Agregar a favoritos" en PublicationDetail.jsx hace `handleBuyNow()` en lugar de `addFavorite()`
- `updatePublication` definido en service pero el botón "Editar" en MyPublications.jsx no tiene handler
- `getUserProfile`/`updateUserProfile` en authService.js no se usan — Profile.jsx usa estado local sin llamar al backend
- AuthContext expone `updateProfile` en la documentación CLAUDE.md pero el código real NO tiene esa función
- CartContext no persiste en localStorage — el carrito se pierde al recargar
- Profile.jsx usa controlled inputs (handleChange) en lugar de react-hook-form — viola convención del proyecto
- Rutas frontend en español (/perfil, /pedidos, /mis-publicaciones) pero CLAUDE.md documenta en inglés (/profile, /orders, /my-publications) — inconsistencia de documentación
- GET /publications del backend retorna campo `vendedor` pero el frontend espera `user` en ProductCard

Emojis en JSX (auditoría 2026-05-26):
- Home.jsx línea 63: ☕ (En Grano), línea 64: ⚗️ (Molienda), línea 65: 🔥 (Tueste Medio), línea 66: 🌑 (Tueste Italiano)
- Gallery.jsx línea 64: 🔍 (icono búsqueda), línea 113: ☕ (estado vacío)
- Navbar.jsx línea 43: 🛍️ (ícono carrito)
- ProductCard.jsx línea 53: 🛒 (botón add-to-cart)
- PublicationDetail.jsx línea 138: 🛒 (texto botón), línea 141: ♡ (favoritos)
- MyPublications.jsx línea 75: 🔄 (aviso C2C), línea 88: 📦 (estado vacío), línea 120: 🗑 (botón eliminar)
- Cart.jsx línea 43: 🛍️ (estado carrito vacío)
- Orders.jsx línea 75: 📭 (estado sin pedidos)
- Profile.jsx línea 39: ✕ y ✏ (botones editar/cancelar)

Delete en backend: DELETE físico (`DELETE FROM publication WHERE id = $1`) — sin campo `active` en schema.sql
La tabla `publication` requeriría ALTER TABLE para agregar `active BOOLEAN DEFAULT true` antes de implementar soft delete.

Inconsistencia de respuesta GET /publications: backend retorna array plano con campo `vendedor`, frontend espera `user`. El componente ProductCard usa `publication.user?.nombre` que quedaría undefined con datos reales del backend.

**Why:** Auditoría para planificar mejoras antes de la presentación final (Hito 5)
**How to apply:** Usar este diagnóstico para priorizar las implementaciones pendientes
