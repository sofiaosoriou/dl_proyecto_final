import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getPublicationById, updatePublication } from '../services/publicationsService'

const TUESTOS = ['Tueste Medio', 'Tueste Italiano', 'Claro', 'Oscuro']
const MOLIENDAS = ['Grano Entero', 'Molienda Gruesa', 'Molienda Media', 'Molienda Fina', 'Espresso', 'Prensa Francesa', 'Cold Brew']

const EditPublication = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPublicationById(id)
        reset({
          titulo: data.titulo || '',
          precio: data.precio || '',
          tipo_molienda: data.tipo_molienda || '',
          tipo_tueste: data.tipo_tueste || '',
          origen_pais: data.origen_pais || '',
          origen_region: data.origen_region || '',
          descripcion: data.descripcion || '',
          stock: data.stock ?? 0,
          imagen_url: data.imagen_url || '',
        })
      } catch {
        alert('No se pudo cargar la publicación.')
        navigate('/mis-publicaciones')
      }
    }
    load()
  }, [id, reset, navigate])

  const onSubmit = async (data) => {
    try {
      await updatePublication(id, {
        ...data,
        precio: parseFloat(data.precio),
        stock: parseInt(data.stock),
      })
      navigate('/mis-publicaciones')
    } catch {
      alert('Error al actualizar la publicación. Intenta de nuevo.')
    }
  }

  return (
    <div style={{ padding: '48px 60px', maxWidth: 860, margin: '0 auto' }}>
      <div className="mk-page-label">Editar publicación</div>
      <div className="mk-page-title">Editar tu café</div>
      <div className="mk-page-div" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mk-form-grid-2">
          <div className="mk-fgroup">
            <label className="mk-flabel">Nombre de la variedad *</label>
            <input
              type="text"
              className={`mk-finput${errors.titulo ? ' mk-error' : ''}`}
              placeholder="Ej: Tierra de los Incas, Sidama..."
              {...register('titulo', { required: 'El título es obligatorio', minLength: { value: 5, message: 'Mínimo 5 caracteres' } })}
            />
            {errors.titulo && <div className="mk-ferror">{errors.titulo.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">Precio por 250g (CLP) *</label>
            <input
              type="number"
              className={`mk-finput${errors.precio ? ' mk-error' : ''}`}
              placeholder="Ej: 9.990"
              min={100}
              {...register('precio', { required: 'El precio es obligatorio', min: { value: 100, message: 'Precio mínimo $100' } })}
            />
            {errors.precio && <div className="mk-ferror">{errors.precio.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">Tipo de molienda *</label>
            <select
              className={`mk-fselect${errors.tipo_molienda ? ' mk-error' : ''}`}
              {...register('tipo_molienda', { required: 'Selecciona la molienda' })}
            >
              <option value="">▼ Seleccionar...</option>
              {MOLIENDAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.tipo_molienda && <div className="mk-ferror">{errors.tipo_molienda.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">Tipo de tueste *</label>
            <select
              className={`mk-fselect${errors.tipo_tueste ? ' mk-error' : ''}`}
              {...register('tipo_tueste', { required: 'Selecciona el tueste' })}
            >
              <option value="">▼ Seleccionar...</option>
              {TUESTOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.tipo_tueste && <div className="mk-ferror">{errors.tipo_tueste.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">País de origen *</label>
            <input
              type="text"
              className={`mk-finput${errors.origen_pais ? ' mk-error' : ''}`}
              placeholder="Ej: Perú, Colombia, Etiopía..."
              {...register('origen_pais', { required: 'El país de origen es obligatorio' })}
            />
            {errors.origen_pais && <div className="mk-ferror">{errors.origen_pais.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">Región de origen</label>
            <input
              type="text"
              className="mk-finput"
              placeholder="Ej: Cuenca Central, Sidama..."
              {...register('origen_region')}
            />
          </div>
        </div>

        <div className="mk-fgroup" style={{ marginTop: 4 }}>
          <label className="mk-flabel">Descripción *</label>
          <textarea
            className={`mk-ftextarea${errors.descripcion ? ' mk-error' : ''}`}
            placeholder="Describe el perfil de sabor, notas de cata, proceso, altura de cultivo..."
            {...register('descripcion', { required: 'La descripción es obligatoria', minLength: { value: 20, message: 'Mínimo 20 caracteres' } })}
          />
          {errors.descripcion && <div className="mk-ferror">{errors.descripcion.message}</div>}
        </div>

        <div className="mk-fgroup">
          <label className="mk-flabel">Stock (unidades) *</label>
          <input
            type="number"
            className={`mk-finput${errors.stock ? ' mk-error' : ''}`}
            placeholder="0"
            min={0}
            style={{ maxWidth: 200 }}
            {...register('stock', { required: 'El stock es obligatorio', min: { value: 0, message: 'El stock no puede ser negativo' } })}
          />
          {errors.stock && <div className="mk-ferror">{errors.stock.message}</div>}
        </div>

        <div className="mk-fgroup">
          <label className="mk-flabel">URL de imagen del producto</label>
          <input
            type="url"
            className="mk-finput"
            placeholder="https://... (URL de imagen)"
            {...register('imagen_url')}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
          <button type="button" className="mk-fbtn-outline" onClick={() => navigate('/mis-publicaciones')}>
            Cancelar
          </button>
          <button type="submit" className="mk-fbtn" style={{ marginTop: 0 }} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditPublication
