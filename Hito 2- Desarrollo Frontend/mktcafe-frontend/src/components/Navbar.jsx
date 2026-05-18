import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="mk-nav">
      <Link className="mk-nav-logo" to="/">MktCafé</Link>

      <div className="mk-nav-links">
        <Link className={`mk-nav-link ${isActive('/')}`} to="/">Home</Link>
        <Link className={`mk-nav-link ${isActive('/tienda')}`} to="/tienda">Tienda</Link>
        {isAuthenticated && (
          <>
            <Link className={`mk-nav-link ${isActive('/mis-publicaciones')}`} to="/mis-publicaciones">
              Mis ventas
            </Link>
            <Link className={`mk-nav-link ${isActive('/pedidos')}`} to="/pedidos">
              Mis pedidos
            </Link>
            <Link className={`mk-nav-link ${isActive('/perfil')}`} to="/perfil">
              {user?.nombre}
            </Link>
          </>
        )}
      </div>

      <div className="mk-nav-links">
        <Link className="mk-cart-icon" to="/carrito">
          🛍️
          {totalItems > 0 && (
            <span className="mk-cart-badge">{totalItems}</span>
          )}
        </Link>

        {isAuthenticated ? (
          <>
            <Link className="mk-nav-cta" to="/publicaciones/nueva">+ Publicar</Link>
            <button className="mk-nav-btn" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <Link className="mk-nav-btn" to="/register">Registrarse</Link>
            <Link className="mk-nav-cta" to="/login">Iniciar sesión</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
