import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPublicationById, addFavorite, removeFavorite } from '../services/publicationsService'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const SAMPLE = {
  id: 1,
  titulo: 'Sidama',
  descripcion: 'Café de especialidad proveniente de la región de Sidama, Etiopía. Tueste medio. Notas florales, cítricos y frutos rojos. Perfecto para métodos de filtro y espresso suave.',
  precio: 11500,
  origen_pais: 'Etiopía',
  origen_region: 'Sidama',
  tipo_tueste: 'Tueste Medio',
  tipo_molienda: 'Molienda Fina',
  stock: 12,
  imagen_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
  user: { nombre: 'Juan Carlos Pérez', foto_url: null },
}

const PublicationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [publication, setPublication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPublicationById(id)
        setPublication(data)
      } catch {
        setPublication({ ...SAMPLE, id: parseInt(id) })
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ id: publication.id, titulo: publication.titulo, precio: publication.precio, imagen_url: publication.imagen_url, stock: publication.stock })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate(isAuthenticated ? '/carrito' : '/login')
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      if (isFavorited) {
        await removeFavorite(publication.id)
        setIsFavorited(false)
      } else {
        await addFavorite(publication.id)
        setIsFavorited(true)
      }
    } catch {
      // Silently ignore favorites errors (backend may not have the route)
    }
  }

  if (loading) return <div className="mk-loading"><div className="mk-spinner" /></div>

  if (!publication) {
    return (
      <div className="mk-empty" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p>Publicación no encontrada.</p>
        <Link to="/tienda" className="mk-btn-sm-dark" style={{ marginTop: 16 }}>← Volver a la tienda</Link>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mk-breadcrumb">
        <Link to="/tienda">← Tienda</Link>
        {publication.tipo_molienda && <> &nbsp;/&nbsp; {publication.tipo_molienda}</>}
        {publication.tipo_tueste && <> · {publication.tipo_tueste}</>}
        &nbsp;/&nbsp; <strong style={{ color: '#111' }}>{publication.titulo}</strong>
      </div>

      {/* Detail layout */}
      <div className="mk-detail-layout">
        {/* Gallery */}
        <div className="mk-detail-gallery">
          <div className="mk-main-img">
            {publication.imagen_url
              ? <img src={publication.imagen_url} alt={publication.titulo} />
              : '[ IMAGEN PRINCIPAL ]'
            }
          </div>
        </div>

        {/* Info */}
        <div className="mk-detail-info">
          <div className="mk-detail-cat">
            {[publication.tipo_molienda, publication.tipo_tueste].filter(Boolean).join(' · ')}
          </div>
          <div className="mk-detail-title">
            {publication.titulo}
            {publication.origen_pais && (
              <><br /><span style={{ fontSize: 14, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#bbb' }}>Origen: {publication.origen_pais}</span></>
            )}
          </div>
          <div className="mk-detail-price">
            ${publication.precio?.toLocaleString('es-CL')}
            <span style={{ fontSize: 12, fontWeight: 400, color: '#bbb', marginLeft: 4 }}>/ 250g</span>
          </div>
          {publication.origen_region && (
            <div className="mk-detail-meta">Región: {publication.origen_region}</div>
          )}
          <div className="mk-detail-div" />
          <div className="mk-detail-desc">{publication.descripcion}</div>

          {/* Stock */}
          <div style={{ fontSize: 10, color: publication.stock > 0 ? '#555' : '#c0392b', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>
            {publication.stock > 0 ? `Stock: ${publication.stock} unidades` : 'Sin stock'}
          </div>

          {/* Seller */}
          <div className="mk-seller-row">
            <div className="mk-seller-avatar" />
            <div>
              <div className="mk-seller-name">
                {(publication.user || publication.vendedor)?.nombre || 'Vendedor'}
              </div>
              <div className="mk-seller-label">Vendedor · MktCafé</div>
            </div>
          </div>

          {/* Quantity */}
          <div className="mk-qty">
            <span className="mk-qty-label">Cantidad</span>
            <button className="mk-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <div className="mk-qty-num">{quantity}</div>
            <button className="mk-qty-btn" onClick={() => setQuantity(q => Math.min(publication.stock || 1, q + 1))}>+</button>
            <span className="mk-qty-stock">Stock: {publication.stock} unidades</span>
          </div>

          {/* Actions */}
          <div className="mk-action-row">
            <button className="mk-btn-dark" onClick={handleAddToCart} disabled={!publication.stock}>
              {added ? '✓ Agregado al carrito' : '🛒 Agregar al carrito'}
            </button>
            <button className="mk-btn-outline" onClick={handleToggleFavorite}>
              {isFavorited ? '❤️ En favoritos' : '♡ Agregar a favoritos'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default PublicationDetail
