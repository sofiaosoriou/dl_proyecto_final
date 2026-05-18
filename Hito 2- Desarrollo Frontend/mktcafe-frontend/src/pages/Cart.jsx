import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Cart = () => {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const ENVIO = 3000

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      clearCart()
      navigate('/pedidos')
    }
  }

  if (totalItems === 0) {
    return (
      <div className="mk-empty" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mk-empty-icon">🛍️</div>
        <p>Tu carrito está vacío.</p>
        <Link to="/tienda" className="mk-btn-sm-dark" style={{ marginTop: 16 }}>Ir a la tienda</Link>
      </div>
    )
  }

  return (
    <div className="mk-cart-page">
      <div className="mk-page-label">Resumen de compra</div>
      <div className="mk-page-title">Tu Carrito</div>
      <div className="mk-page-div" />

      <div className="mk-cart-layout">
        {/* Items */}
        <div>
          {items.map((item) => (
            <div key={item.id} className="mk-cart-item">
              <div className="mk-cart-thumb">
                {item.imagen_url
                  ? <img src={item.imagen_url} alt={item.titulo} />
                  : null
                }
              </div>
              <div style={{ flex: 1 }}>
                <div className="mk-cart-item-cat">250g</div>
                <div className="mk-cart-item-name">{item.titulo}</div>
                <div className="mk-cart-item-origin">${item.precio?.toLocaleString('es-CL')} c/u</div>
              </div>
              <div className="mk-cart-qty">
                <button className="mk-cart-qty-btn" onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))}>−</button>
                <span className="mk-cart-qty-num">{item.cantidad}</span>
                <button className="mk-cart-qty-btn" onClick={() => updateQuantity(item.id, Math.min(item.stock, item.cantidad + 1))}>+</button>
              </div>
              <div className="mk-cart-item-total">${(item.precio * item.cantidad).toLocaleString('es-CL')}</div>
              <button className="mk-cart-remove" onClick={() => removeItem(item.id)}>×</button>
            </div>
          ))}

          <div style={{ paddingTop: 16 }}>
            <button
              className="mk-btn-sm-outline"
              onClick={clearCart}
              style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', borderBottom: '1px solid #ddd', border: 'none', background: 'none', color: '#bbb', cursor: 'pointer', padding: '2px 0' }}
            >
              ← Vaciar carrito
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mk-cart-summary">
          <div className="mk-summary-label">Resumen del pedido</div>
          <div className="mk-summary-row">
            <span>Subtotal ({totalItems} productos)</span>
            <span>${totalPrice.toLocaleString('es-CL')}</span>
          </div>
          <div className="mk-summary-row">
            <span>Envío</span>
            <span>${ENVIO.toLocaleString('es-CL')}</span>
          </div>
          <div className="mk-summary-divider" />
          <div className="mk-summary-total">
            <span>Total</span>
            <span>${(totalPrice + ENVIO).toLocaleString('es-CL')}</span>
          </div>
          <button className="mk-btn-dark" onClick={handleCheckout}>
            {isAuthenticated ? 'Proceder al pago →' : 'Inicia sesión para comprar'}
          </button>
          <div className="mk-secure-label">Pago 100% seguro</div>
        </div>
      </div>
    </div>
  )
}

export default Cart
