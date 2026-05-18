import { useState, useEffect, useCallback } from 'react'
import ProductCard from '../components/ProductCard'
import { getPublications } from '../services/publicationsService'

const SAMPLE_PUBLICATIONS = [
  { id: 1, titulo: 'Tierra de los Incas', descripcion: 'Notas de arándanos, jazmín y chocolate oscuro.', precio: 9990, origen_pais: 'Perú', tipo_tueste: 'Tueste Medio', tipo_molienda: 'Grano Entero', stock: 15, imagen_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', user: { nombre: 'Carlos Torres' } },
  { id: 2, titulo: 'Tierra de Volcanes', descripcion: 'Acidez cítrica brillante con notas de panela y mandarina.', precio: 10500, origen_pais: 'El Salvador', tipo_tueste: 'Tueste Italiano', tipo_molienda: 'Grano Entero', stock: 8, imagen_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', user: { nombre: 'María López' } },
  { id: 3, titulo: 'País Cafetero', descripcion: 'Equilibrado y suave, con cacao, nuez moscada y cítricos.', precio: 8500, origen_pais: 'Colombia', tipo_tueste: 'Tueste Medio', tipo_molienda: 'Molienda Media', stock: 20, imagen_url: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400', user: { nombre: 'Pedro Sánchez' } },
  { id: 4, titulo: 'Sidama', descripcion: 'Café de especialidad de la región de Sidama, Etiopía.', precio: 11500, origen_pais: 'Etiopía', tipo_tueste: 'Tueste Medio', tipo_molienda: 'Molienda Fina', stock: 5, imagen_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', user: { nombre: 'Lucía Ramírez' } },
  { id: 5, titulo: 'Amazonía Alta', descripcion: 'Dulce, con notas de caramelo y frutos secos.', precio: 9200, origen_pais: 'Perú', tipo_tueste: 'Tueste Italiano', tipo_molienda: 'Molienda Gruesa', stock: 12, imagen_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400', user: { nombre: 'Diego Flores' } },
  { id: 6, titulo: 'Tierra de los Incas II', descripcion: 'Segunda cosecha. Perfil frutal y floral único.', precio: 9990, origen_pais: 'Perú', tipo_tueste: 'Tueste Medio', tipo_molienda: 'Grano Entero', stock: 18, imagen_url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=400', user: { nombre: 'Ana Martínez' } },
]

const TUESTOS = ['Todos', 'Tueste Medio', 'Tueste Italiano', 'Claro', 'Oscuro']
const MOLIENDAS = ['Todos', 'Grano Entero', 'Molienda Gruesa', 'Molienda Media', 'Molienda Fina']

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
      } catch {
        setPublications(SAMPLE_PUBLICATIONS)
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
          <span style={{ color: '#ccc' }}>🔍</span>
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
          {['Todos', 'Grano Entero', 'Molienda Gruesa', 'Molienda Media', 'Molienda Fina', 'Tueste Medio', 'Tueste Italiano'].map(label => (
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
            <div className="mk-empty-icon">☕</div>
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
