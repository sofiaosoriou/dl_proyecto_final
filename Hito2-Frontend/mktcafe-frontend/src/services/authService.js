import api from './axiosConfig'

// POST /api/auth/register — Registro de usuario
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

// POST /api/auth/login — Inicio de sesión
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

// GET /api/users/:id — Obtener perfil del usuario autenticado
export const getUserProfile = async () => {
  const user = JSON.parse(localStorage.getItem('mktcafe_user') || '{}')
  const response = await api.get(`/users/${user.id}`)
  return response.data
}

// PUT /api/users/:id — Actualizar perfil del usuario autenticado
export const updateUserProfile = async (profileData) => {
  const user = JSON.parse(localStorage.getItem('mktcafe_user') || '{}')
  const response = await api.put(`/users/${user.id}`, profileData)
  return response.data
}
