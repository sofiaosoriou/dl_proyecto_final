import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { FaHeart } from 'react-icons/fa'
import api from '../services/axiosConfig'

const Favorites = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/favorites')
        setFavorites(response.data)
      } catch (error) {
        console.error('Error al cargar favoritos:', error)
        setFavorites([])
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  if (loading) return <div className="mk-loading"><div className="mk-spinner" /></div>

  return (
    <div style={{ padding: '48px 60px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="mk-page-label">Mi cuenta</div>
      <div className="mk-page-title">Mis Favoritos</div>
      <div className="mk-page-div" />

      {favorites.length === 0 ? (
        <div className="mk-empty">
          <div className="mk-empty-icon" style={{ fontSize: '2.5rem' }}><FaHeart /></div>
          <p>No tienes favoritos aún.</p>
          <Link to="/tienda" className="mk-btn-sm-dark" style={{ marginTop: 16 }}>
            Explorar tienda
          </Link>
        </div>
      ) : (
        <>
          <div className="mk-result-count">
            {favorites.length} {favorites.length === 1 ? 'favorito' : 'favoritos'}
          </div>
          <div className="mk-grid-3">
            {favorites.map((pub) => (
              <ProductCard key={pub.id} publication={pub} showActions={true} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Favorites
