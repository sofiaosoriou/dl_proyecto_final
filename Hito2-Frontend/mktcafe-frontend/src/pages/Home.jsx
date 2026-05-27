import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getPublications } from '../services/publicationsService'
import { useAuth } from '../context/AuthContext'
import { FaCoffee, FaFire } from 'react-icons/fa'
import { GiCoffeeBeans } from 'react-icons/gi'
import { BsCircleFill } from 'react-icons/bs'

const SAMPLE_PUBLICATIONS = [
  { id: 1, titulo: 'Tierra de los Incas', precio: 9990, origen_pais: 'Perú', origen_region: 'Cuenca Central', tipo_tueste: 'Tueste Medio', tipo_molienda: 'Grano Entero', stock: 15, imagen_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', user: { nombre: 'Carlos Torres' } },
  { id: 2, titulo: 'Tierra de Volcanes', precio: 10500, origen_pais: 'El Salvador', tipo_tueste: 'Tueste Italiano', tipo_molienda: 'Grano Entero', stock: 8, imagen_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', user: { nombre: 'María López' } },
  { id: 3, titulo: 'País Cafetero', precio: 8500, origen_pais: 'Colombia', tipo_tueste: 'Tueste Medio', tipo_molienda: 'Molienda Media', stock: 20, imagen_url: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400', user: { nombre: 'Pedro Sánchez' } },
]

const Home = () => {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPublications({ limit: 3 })
        setPublications(data.publications || data)
      } catch {
        setPublications(SAMPLE_PUBLICATIONS)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleCTA = () => {
    navigate(isAuthenticated ? '/publicaciones/nueva' : '/register')
  }

  return (
    <>
      {/* HERO */}
      <div className="mk-hero">
        <div className="mk-hero-tag"> ★ &nbsp; COSECHA EN ALTURA &nbsp; ★ </div>
        <h1 className="mk-hero-title">Del productor<br />a tu taza.</h1>
        <p className="mk-hero-desc">Café de especialidad directo del origen. Compra, vende y conecta con la comunidad cafetera.</p>
        <div className="mk-hero-btns">
          <Link className="mk-btn-white" to="/tienda">Explorar cafés</Link>
          <button className="mk-btn-outline-white" onClick={handleCTA}>
            {isAuthenticated ? 'Publicar producto' : 'Unirme como vendedor'}
          </button>
        </div>
      </div>

      {/* INTRO */}
      <div className="mk-section-white" style={{ textAlign: 'center', padding: '56px 80px' }}>
        <div className="mk-section-tag">Lo que ofrecemos</div>
        <div className="mk-section-title" style={{ fontSize: 26 }}>Café directo del origen.</div>
        <div className="mk-section-div" style={{ margin: '14px auto 20px' }} />
        <p style={{ fontSize: 12, color: '#999', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
          Encuentra variedades únicas de café en grano entero, molienda gruesa, media o fina.
          Tueste medio o italiano. Compra, vende y conecta con la comunidad cafetera de Chile.
        </p>
        <div className="mk-features">
          {[
            { icon: <FaCoffee />, label: 'En Grano' },
            { icon: <GiCoffeeBeans />, label: 'Molienda' },
            { icon: <FaFire />, label: 'Tueste Medio' },
            { icon: <BsCircleFill style={{ color: '#111' }} />, label: 'Tueste Italiano' },
          ].map((f) => (
            <div className="mk-feature" key={f.label}>
              <div className="mk-feature-icon" style={{ fontSize: '1.4rem' }}>{f.icon}</div>
              <div className="mk-feature-divider" />
              <div className="mk-feature-label">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DESTACADOS */}
      <div className="mk-section-dark">
        <div className="mk-featured-layout">
          <div>
            <div className="mk-section-tag">Marketplace</div>
            <div className="mk-section-title" style={{ fontSize: 22, lineHeight: 1.3 }}>Publicaciones<br />destacadas</div>
            <div className="mk-section-div" />
            <p className="mk-featured-desc">
              Descubre los mejores cafés publicados por vendedores de toda Chile.
            </p>
            <Link className="mk-btn-dark-inline" to="/tienda">Ver todos</Link>
          </div>

          {loading ? (
            <div className="mk-loading"><div className="mk-spinner" /></div>
          ) : (
            <div className="mk-grid-3">
              {publications.map((pub) => (
                <ProductCard key={pub.id} publication={pub} showActions={false} dark={true} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUOTE */}
      <div className="mk-quote">
        <p>"El café no es solo una bebida, es un puente entre culturas, personas y momentos únicos."</p>
        <cite>— MktCafé</cite>
      </div>
    </>
  )
}

export default Home
