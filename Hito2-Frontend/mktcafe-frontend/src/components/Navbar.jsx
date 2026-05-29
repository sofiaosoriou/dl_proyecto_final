import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { BsCart3, BsHeart, BsList } from 'react-icons/bs'
import { useState } from 'react'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <nav className="mk-nav">
      <Link className="mk-nav-logo" to="/">MktCafé</Link>

      {/* Siempre visible en móvil: carrito + hamburger */}
      <div className="mk-nav-mobile-bar">
        <Link className="mk-cart-icon" to="/carrito">
          <BsCart3 style={{ fontSize: '1.3rem' }} />
          {totalItems > 0 && (
            <span className="mk-cart-badge">{totalItems}</span>
          )}
        </Link>
        <button className="mk-mobile-menu-btn" onClick={toggleMobileMenu}>
          <BsList style={{ fontSize: '1.5rem' }} />
        </button>
      </div>

      {/* Menú colapsable — contiene todo en móvil */}
      <div className={`mk-nav-links ${mobileMenuOpen ? 'mobile-visible' : ''}`} onClick={() => setMobileMenuOpen(false)}>
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

        {/* Iconos y acciones — visibles en desktop, también en el menú móvil */}
        <div className="mk-nav-actions">
          {isAuthenticated && (
            <Link className="mk-cart-icon" to="/favoritos" title="Mis favoritos">
              <BsHeart style={{ fontSize: '1.2rem' }} />
            </Link>
          )}
          {/* Carrito en desktop (en móvil se muestra arriba, junto al hamburger) */}
          <Link className="mk-cart-icon mk-cart-desktop" to="/carrito">
            <BsCart3 style={{ fontSize: '1.3rem' }} />
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
      </div>
    </nav>
  )
}

export default Navbar
