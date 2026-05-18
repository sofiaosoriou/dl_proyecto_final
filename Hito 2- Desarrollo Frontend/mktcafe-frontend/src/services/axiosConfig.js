import axios from 'axios'

// Instancia base de axios apuntando al backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: agrega el token JWT a cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mktcafe_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta: manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mktcafe_token')
      localStorage.removeItem('mktcafe_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
