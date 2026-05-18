import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser } from '../services/authService'

export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

/* ── Simulación local cuando el backend no está disponible ── */
const LOCAL_USERS_KEY = 'mktcafe_local_users'

const getLocalUsers = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]') } catch { return [] }
}

const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

const mockRegister = ({ nombre, email, password }) => {
  const users = getLocalUsers()
  if (users.find(u => u.email === email)) {
    throw new Error('Ya existe una cuenta con ese correo.')
  }
  const newUser = { id: Date.now(), nombre, email, password, created_at: new Date().toISOString() }
  saveLocalUsers([...users, newUser])
  const { password: _, ...safeUser } = newUser
  return { user: safeUser, token: `mock-token-${newUser.id}` }
}

const mockLogin = ({ email, password }) => {
  const users = getLocalUsers()
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Correo o contraseña incorrectos.')
  const { password: _, ...safeUser } = user
  return { user: safeUser, token: `mock-token-${user.id}` }
}

/* ─────────────────────────────────────────────────────────── */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('mktcafe_token')
    const savedUser = localStorage.getItem('mktcafe_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const persistSession = (data) => {
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('mktcafe_token', data.token)
    localStorage.setItem('mktcafe_user', JSON.stringify(data.user))
  }

  const login = async (email, password) => {
    setError(null)
    try {
      const data = await loginUser({ email, password })
      persistSession(data)
      return true
    } catch (err) {
      if (!err.response) {
        // Backend no disponible — usar simulación local
        try {
          const data = mockLogin({ email, password })
          persistSession(data)
          return true
        } catch (mockErr) {
          setError(mockErr.message)
          return false
        }
      }
      setError(err.response?.data?.message || 'Error al iniciar sesión')
      return false
    }
  }

  const register = async (nombre, email, password, foto_url) => {
    setError(null)
    try {
      const data = await registerUser({ nombre, email, password, foto_url })
      persistSession(data)
      return true
    } catch (err) {
      if (!err.response) {
        // Backend no disponible — usar simulación local
        try {
          const data = mockRegister({ nombre, email, password })
          persistSession(data)
          return true
        } catch (mockErr) {
          setError(mockErr.message)
          return false
        }
      }
      setError(err.response?.data?.message || 'Error al registrarse')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('mktcafe_token')
    localStorage.removeItem('mktcafe_user')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, error, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
