import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyPublications, deletePublication } from '../services/publicationsService'
import { useAuth } from '../context/AuthContext'

const SAMPLE_MY_PUBS = [
  { id: 1, titulo: 'Tierra de los Incas', origen_pais: 'Perú', origen_region: 'Cuenca Central', tipo_tueste: 'Tueste Medio', tipo_molienda: 'Grano Entero', precio: 9990, imagen_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100' },
  { id: 4, titulo: 'Sidama', origen_pais: 'Etiopía', tipo_tueste: 'Tueste Medio', tipo_molienda: 'Molienda Fina', precio: 11500, imagen_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100' },
  { id: 5, titulo: 'Amazonía Alta', origen_pais: 'Perú', tipo_tueste: 'Tueste Italiano', tipo_molienda: 'Molienda Gruesa', precio: 9200, imagen_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=100' },
]

const MyPublications = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMyPublications()
        setPublications(data.publications || data)
      } catch {
        setPublications(SAMPLE_MY_PUBS)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return
    try {
      await deletePublication(id)
      setPublications(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('No se pudo eliminar. Intenta de nuevo.')
    }
  }

  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'MK'

  if (loading) return <div className="mk-loading"><div className="mk-spinner" /></div>

  return (
    <>
      {/* Profile header */}
      <div className="mk-profile-header">
        <div className="mk-avatar">{initials}</div>
        <div>
          <div className="mk-profile-name">{user?.nombre}</div>
          <div className="mk-profile-email">{user?.email}</div>
          <div className="mk-profile-bio">Vendedor · MktCafé</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 0 }}>
          <div className="mk-stat">
            <div className="mk-stat-num">{publications.length}</div>
            <div className="mk-stat-label">Publicaciones</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mk-tabs">
        <button className="mk-tab active">Mis publicaciones</button>
        <Link to="/pedidos" className="mk-tab" style={{ textDecoration: 'none' }}>Mis pedidos</Link>
        <Link to="/perfil" className="mk-tab" style={{ textDecoration: 'none' }}>Mi perfil</Link>
      </div>

      <div className="mk-tab-content">
        {/* Info C2C */}
        <div className="mk-c2c-notice">
          <span>🔄</span>
          <span>Como vendedor, solo puedes editar o eliminar <strong style={{ color: '#111' }}>tus propias publicaciones</strong>.</span>
        </div>

        {/* Botón nueva publicación */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <Link to="/publicaciones/nueva" className="mk-nav-cta">+ Publicar café</Link>
        </div>

        {publications.length === 0 ? (
          <div className="mk-empty">
            <div className="mk-empty-icon">📦</div>
            <p>No tienes publicaciones aún.</p>
            <Link to="/publicaciones/nueva" className="mk-btn-sm-dark" style={{ marginTop: 16 }}>
              Crear mi primera publicación
            </Link>
          </div>
        ) : (
          <div className="mk-seller-table">
            <div className="mk-seller-head">
              <span>IMG</span>
              <span>Producto</span>
              <span>Molienda / Tueste</span>
              <span>Precio</span>
              <span>Ventas</span>
              <span>Acciones</span>
            </div>
            {publications.map((pub) => (
              <div key={pub.id} className="mk-seller-row">
                <div className="mk-seller-thumb">
                  {pub.imagen_url && <img src={pub.imagen_url} alt={pub.titulo} />}
                </div>
                <div>
                  <div className="mk-seller-product-name">{pub.titulo}</div>
                  <div className="mk-seller-product-origin">
                    Origen: {pub.origen_pais}{pub.origen_region ? ` · ${pub.origen_region}` : ''}
                  </div>
                </div>
                <span className="mk-seller-molienda">
                  {[pub.tipo_molienda, pub.tipo_tueste].filter(Boolean).join(' · ')}
                </span>
                <span className="mk-seller-price">${pub.precio?.toLocaleString('es-CL')}</span>
                <span className="mk-seller-sales">— ventas</span>
                <div className="mk-seller-actions">
                  <button className="mk-btn-sm-dark" onClick={() => navigate(`/publicaciones/${pub.id}/editar`)}>Editar</button>
                  <button className="mk-btn-sm-danger" onClick={() => handleDelete(pub.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default MyPublications
