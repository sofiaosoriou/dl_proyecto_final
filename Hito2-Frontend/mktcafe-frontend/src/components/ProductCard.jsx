import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { FaCartPlus } from 'react-icons/fa'

const ProductCard = ({ publication, showActions = true, dark = false }) => {
  const { addItem } = useCart()

  const {
    id,
    titulo,
    precio,
    imagen_url,
    origen_pais,
    tipo_tueste,
    tipo_molienda,
    stock,
  } = publication

  // El backend puede retornar el vendedor bajo la clave 'vendedor' o 'user'
  const seller = publication.user || publication.vendedor

  const handleAddToCart = () => {
    addItem({ id, titulo, precio, imagen_url, stock })
  }

  const cardClass = `mk-product-card${dark ? ' mk-product-card-dark' : ''}`

  return (
    <div className={cardClass}>
      <div className="mk-product-img">
        {imagen_url
          ? <img src={imagen_url} alt={titulo} />
          : '[ IMAGEN ]'
        }
      </div>
      <div className="mk-product-cat">
        {[tipo_molienda, tipo_tueste].filter(Boolean).join(' · ')}
      </div>
      <div className="mk-product-name">{titulo}</div>
      <div className="mk-product-price">${precio?.toLocaleString('es-CL')}</div>
      {origen_pais && (
        <div className="mk-product-seller">Origen: {origen_pais}</div>
      )}
      {seller?.nombre && (
        <div className="mk-product-seller">Por: {seller.nombre}</div>
      )}

      {showActions && (
        <div className="mk-product-actions">
          <Link to={`/publicaciones/${id}`} className="mk-btn-sm-dark">Ver detalle</Link>
          <button
            className="mk-btn-sm-outline"
            onClick={handleAddToCart}
            disabled={!stock || stock === 0}
          >
            <FaCartPlus style={{ fontSize: '1rem' }} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductCard
