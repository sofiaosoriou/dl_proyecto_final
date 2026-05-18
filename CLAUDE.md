# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MktCafé** — a specialty coffee marketplace SPA built as a Desafío Latam final project. Users can browse, buy, and list coffee products. The repo contains two milestone folders; active frontend work lives in `Hito 2- Desarrollo Frontend/mktcafe-frontend/`.

## Commands

All commands run from `Hito 2- Desarrollo Frontend/mktcafe-frontend/`:

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint across all source files
```

No test framework is configured. There are no test scripts.

## Environment Setup

Copy `.env.example` to `.env` and set:

```
VITE_API_URL=http://localhost:3000/api
```

The Axios instance in `src/services/axiosConfig.js` reads `VITE_API_URL` as the base URL. If the backend is unavailable, `src/pages/Gallery.jsx` falls back to `SAMPLE_PUBLICATIONS` static data.

## Architecture

### State Management (Context API)

Two global providers wrap the app in `src/App.jsx`:

- **`AuthContext`** (`src/context/AuthContext.jsx`) — stores user object and JWT token, persisted to `localStorage`. Exposes `login`, `register`, `logout`, and `updateProfile`.
- **`CartContext`** (`src/context/CartContext.jsx`) — manages cart with a `useReducer` pattern. Actions: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`.

### API / Service Layer

- **`src/services/axiosConfig.js`** — creates the shared Axios instance. A request interceptor attaches `Authorization: Bearer <token>` from `localStorage`. A response interceptor catches 401s, clears the session, and redirects to `/login`.
- **`src/services/authService.js`** — `registerUser`, `loginUser`, `getUserProfile`, `updateUserProfile`.
- **`src/services/publicationsService.js`** — publications CRUD (`getPublications`, `getPublicationById`, `createPublication`, `updatePublication`, `deletePublication`), orders (`getOrders`, `createOrder`), and favorites (`addFavorite`, `removeFavorite`).

### Routing & Route Protection

React Router v6 is configured in `src/App.jsx`. `src/components/PrivateRoute.jsx` wraps protected pages — it reads `AuthContext` and renders `<Navigate to="/login" />` for unauthenticated users.

Protected routes: `/profile`, `/orders`, `/my-publications`, `/create-publication`.

### Form Handling

All forms use **react-hook-form**. Validation rules are defined inline; async submission sets a local `loading` state and catches errors for display. Do not replace this with controlled component state.

### Key Conventions

- Functional components with hooks only — no class components.
- `useCallback` for filter/sort handlers in list pages (see `Gallery.jsx`) to avoid unnecessary re-renders.
- `ProductCard.jsx` accepts a `showActions` prop to toggle seller-specific controls; keep this pattern when extending the card.
- CSS: Bootstrap 5 utility classes for layout; custom overrides in `src/index.css` and `src/App.css`.
