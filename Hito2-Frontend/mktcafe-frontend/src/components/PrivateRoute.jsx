import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="mk-loading"><div className="mk-spinner" /></div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
