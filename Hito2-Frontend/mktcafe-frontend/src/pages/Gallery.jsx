import { useState, useEffect, useCallback } from 'react'
import ProductCard from '../components/ProductCard'
import { getPublications } from '../services/publicationsService'
import { FaSearch, FaCoffee } from 'react-icons/fa'


const TUESTOS = ['Todos', 'Tueste Medio', 'Tueste Italiano', 'Claro', 'Oscuro']
const MOLIENDAS = ['Todos', 'Grano Entero', 'Molienda Gruesa', 'Molienda Media', 'Molienda Fina', 'Espresso', 'Prensa Francesa', 'Cold Brew']

const Gallery = () => {
  const [publications, setPublications] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTueste, setFilterTueste] = useState('Todos')
  const [filterMolienda, setFilterMolienda] = useState('Todos')
  const [sortBy, setSortBy] = useState('reciente')

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPublications()
        setPublications(data.publications || data)
      } catch (err) {
        console.error('Error al cargar publicaciones:', err)
        setPublications([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const applyFilters = useCallback(() => {
    let result = [...publications]
    if (search) {
      result = result.filter(p =>
        p.titulo.toLowerCase().includes(search.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        p.origen_pais?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (filterTueste !== 'Todos') result = result.filter(p => p.tipo_tueste === filterTueste)
    if (filterMolienda !== 'Todos') result = result.filter(p => p.tipo_molienda === filterMolienda)
    if (sortBy === 'precio_asc') result.sort((a, b) => a.precio - b.precio)
    if (sortBy === 'precio_desc') result.sort((a, b) => b.precio - a.precio)
    if (sortBy === 'reciente') result.sort((a, b) => b.id - a.id)
    setFiltered(result)
  }, [publications, search, filterTueste, filterMolienda, sortBy])

  useEffect(() => { applyFilters() }, [applyFilters])

  return (
    <>
      {/* Search bar */}
      <div className="mk-search-bar">
        <div className="mk-search-input-wrap">
          <FaSearch style={{ color: '#ccc' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, tipo, origen..."
          />
        </div>
        <select className="mk-filter-select" value={filterTueste} onChange={(e) => setFilterTueste(e.target.value)}>
          {TUESTOS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="mk-filter-select" value={filterMolienda} onChange={(e) => setFilterMolienda(e.target.value)}>
          {MOLIENDAS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="mk-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="reciente">Más reciente</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
        </select>
      </div>

      {/* Pills */}
      <div className="mk-gallery-header">
        <div className="mk-pills">
          {['Todos', 'Grano Entero', 'Molienda Gruesa', 'Molienda Media', 'Molienda Fina', 'Espresso', 'Tueste Medio', 'Tueste Italiano', 'Claro', 'Oscuro'].map(label => (
            <button
              key={label}
              className={`mk-pill${filterMolienda === label || filterTueste === label || (label === 'Todos' && filterMolienda === 'Todos' && filterTueste === 'Todos') ? ' active' : ''}`}
              onClick={() => {
                if (label === 'Todos') { setFilterMolienda('Todos'); setFilterTueste('Todos') }
                else if (['Tueste Medio', 'Tueste Italiano', 'Claro', 'Oscuro'].includes(label)) { setFilterTueste(label) }
                else { setFilterMolienda(label) }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mk-result-count">
        Mostrando {filtered.length} de {publications.length} resultados
      </div>

      <div className="mk-gallery-grid">
        {loading ? (
          <div className="mk-loading"><div className="mk-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="mk-empty">
            <div className="mk-empty-icon" style={{ fontSize: '2.5rem' }}><FaCoffee /></div>
            <p>No encontramos cafés con esos filtros.</p>
          </div>
        ) : (
          <div className="mk-grid-3">
            {filtered.map((pub) => (
              <ProductCard key={pub.id} publication={pub} showActions={true} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Gallery
