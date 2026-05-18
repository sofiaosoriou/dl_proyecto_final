import api from './axiosConfig'

// GET /api/publications — Listar todas las publicaciones (con filtros opcionales)
export const getPublications = async (params = {}) => {
  const response = await api.get('/publications', { params })
  return response.data
}

// GET /api/publications/:id — Obtener detalle de una publicación
export const getPublicationById = async (id) => {
  const response = await api.get(`/publications/${id}`)
  return response.data
}

// POST /api/publications — Crear nueva publicación (autenticado)
export const createPublication = async (publicationData) => {
  const response = await api.post('/publications', publicationData)
  return response.data
}

// PUT /api/publications/:id — Actualizar publicación propia
export const updatePublication = async (id, publicationData) => {
  const response = await api.put(`/publications/${id}`, publicationData)
  return response.data
}

// DELETE /api/publications/:id — Eliminar publicación propia
export const deletePublication = async (id) => {
  const response = await api.delete(`/publications/${id}`)
  return response.data
}

// GET /api/publications/mine — Mis publicaciones (autenticado)
export const getMyPublications = async () => {
  const response = await api.get('/publications/mine')
  return response.data
}

// GET /api/orders — Historial de pedidos del usuario
export const getOrders = async () => {
  const response = await api.get('/orders')
  return response.data
}

// POST /api/orders — Crear pedido
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData)
  return response.data
}

// POST /api/favorites/:publicationId — Agregar a favoritos
export const addFavorite = async (publicationId) => {
  const response = await api.post(`/favorites/${publicationId}`)
  return response.data
}

// DELETE /api/favorites/:publicationId — Quitar de favoritos
export const removeFavorite = async (publicationId) => {
  const response = await api.delete(`/favorites/${publicationId}`)
  return response.data
}
