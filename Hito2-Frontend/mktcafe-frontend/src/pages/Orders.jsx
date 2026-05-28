import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../services/publicationsService'
import { FaInbox } from 'react-icons/fa'

const SAMPLE_ORDERS = [
  { id: 124, total: 44980, estado: 'entregado', created_at: '2024-04-18', items: [{ titulo: 'Tierra de los Incas', cantidad: 2, precio_unitario: 9990 }, { titulo: 'Sidama', cantidad: 1, precio_unitario: 11500 }] },
  { id: 118, total: 11500, estado: 'en-camino', created_at: '2024-04-10', items: [{ titulo: 'País Cafetero', cantidad: 1, precio_unitario: 8500 }] },
  { id: 109, total: 29400, estado: 'cancelado', created_at: '2024-04-02', items: [{ titulo: 'Amazonía Alta', cantidad: 2, precio_unitario: 9200 }, { titulo: 'Tierra de Volcanes', cantidad: 1, precio_unitario: 10500 }] },
]

const STATUS_CLASS = {
  entregado: 'mk-status-entregado',
  'en-camino': 'mk-status-en-camino',
  enviado: 'mk-status-enviado',
  pendiente: 'mk-status-pendiente',
  preparando: 'mk-status-preparando',
  cancelado: 'mk-status-cancelado',
}

const STATUS_LABEL = {
  entregado: 'Entregado',
  'en-camino': 'En camino',
  enviado: 'Enviado',
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  cancelado: 'Cancelado',
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Todos')

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getOrders()
        setOrders(data.orders || data)
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
        setOrders([])  // Solo datos de la BD, si falla = vacío
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = activeFilter === 'Todos'
    ? orders
    : orders.filter(o => o.estado === activeFilter.toLowerCase().replace(' ', '-'))

  if (loading) return <div className="mk-loading"><div className="mk-spinner" /></div>

  return (
    <div className="mk-cart-page">
      <div className="mk-page-label">Cuenta</div>
      <div className="mk-page-title">Mis Pedidos</div>
      <div className="mk-page-div" />

      {/* Filtros */}
      <div className="mk-pills">
        {['Todos', 'Pendiente', 'En camino', 'Entregado', 'Cancelado'].map(label => (
          <button
            key={label}
            className={`mk-pill${activeFilter === label ? ' active' : ''}`}
            onClick={() => setActiveFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mk-empty">
          <div className="mk-empty-icon" style={{ fontSize: '2.5rem' }}><FaInbox /></div>
          <p>No tienes pedidos aún.</p>
          <Link to="/tienda" className="mk-btn-sm-dark">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="mk-orders-table">
          <div className="mk-orders-head">
            <span>Nº Pedido</span>
            <span>Productos</span>
            <span>Total</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {filtered.map((order) => (
            <div key={order.id} className="mk-orders-row">
              <span className="mk-order-num">#{String(order.id).padStart(5, '0')}</span>
              <div>
                <div className="mk-order-name">
                  {order.items?.map(i => `${i.titulo} ×${i.cantidad}`).join(' · ')}
                </div>
                <div className="mk-order-sub">
                  {new Date(order.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <span className="mk-order-total">${order.total?.toLocaleString('es-CL')}</span>
              <span className={`mk-status ${STATUS_CLASS[order.estado] || ''}`}>
                {STATUS_LABEL[order.estado] || order.estado}
              </span>
              <span className="mk-btn-sm-outline" style={{ cursor: 'default' }}>Ver detalle</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
