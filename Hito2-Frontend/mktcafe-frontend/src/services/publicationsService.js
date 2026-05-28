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
// El backend usa multer, requiere multipart/form-data
export const createPublication = async (publicationData) => {
  const formData = new FormData()
  Object.entries(publicationData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })
  const response = await api.post('/publications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// PUT /api/publications/:id — Actualizar publicación propia
export const updatePublication = async (id, publicationData) => {
  const response = await api.put(`/publications/${id}`, publicationData)
  return response.data
}

// DELETE /api/publications/:id — Desactivar publicación propia (soft delete)
export const deletePublication = async (id) => {
  const response = await api.delete(`/publications/${id}`)
  return response.data
}

// PUT /api/publications/:id/restore — Reactivar publicación propia
export const restorePublication = async (id) => {
  const response = await api.put(`/publications/${id}/restore`)
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

// GET /api/favorites — Obtener favoritos del usuario
export const getFavorites = async () => {
  const response = await api.get('/favorites')
  return response.data
}
