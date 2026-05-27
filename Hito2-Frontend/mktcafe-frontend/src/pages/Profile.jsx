import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { FaTimes, FaEdit } from 'react-icons/fa'

const Profile = () => {
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('publicaciones')
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      nombre: user?.nombre || '',
      bio: user?.bio || '',
    },
  })

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleEditToggle = () => {
    if (!editMode) {
      reset({ nombre: user?.nombre || '', bio: user?.bio || '' })
    }
    setEditMode(!editMode)
    setSaveError(null)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    setSaveError(null)
    const ok = await updateProfile({ nombre: data.nombre, bio: data.bio })
    setSaving(false)
    if (ok) {
      setEditMode(false)
    } else {
      setSaveError('No se pudo guardar. Intenta de nuevo.')
    }
  }

  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'MK'

  return (
    <>
      {/* Profile header */}
      <div className="mk-profile-header">
        <div className="mk-avatar">{initials}</div>
        <div>
          <div className="mk-profile-name">{user?.nombre}</div>
          <div className="mk-profile-email">{user?.email}</div>
          {user?.bio && <div className="mk-profile-bio">{user.bio}</div>}
          <button className="mk-profile-edit-btn" onClick={handleEditToggle}>
            {editMode
              ? <><FaTimes style={{ marginRight: 4 }} />Cancelar</>
              : <><FaEdit style={{ marginRight: 4 }} />Editar perfil</>
            }
          </button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 0 }}>
          <div className="mk-stat">
            <div className="mk-stat-num">—</div>
            <div className="mk-stat-label">Publicaciones</div>
          </div>
          <div className="mk-stat">
            <div className="mk-stat-num">—</div>
            <div className="mk-stat-label">Pedidos</div>
          </div>
        </div>
        <button
          className="mk-nav-btn"
          style={{ marginLeft: 32, color: '#fff', borderColor: '#444' }}
          onClick={handleLogout}
        >
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="mk-tabs">
        <button className={`mk-tab${activeTab === 'publicaciones' ? ' active' : ''}`} onClick={() => setActiveTab('publicaciones')}>
          Mis publicaciones
        </button>
        <button className={`mk-tab${activeTab === 'pedidos' ? ' active' : ''}`} onClick={() => setActiveTab('pedidos')}>
          Mis pedidos
        </button>
        <button className={`mk-tab${activeTab === 'datos' ? ' active' : ''}`} onClick={() => setActiveTab('datos')}>
          Mis datos
        </button>
      </div>

      <div className="mk-tab-content">
        {activeTab === 'datos' && (
          editMode ? (
            <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 500 }} noValidate>
              <div className="mk-fgroup">
                <label className="mk-flabel">Nombre</label>
                <input
                  type="text"
                  className={`mk-finput${errors.nombre ? ' mk-error' : ''}`}
                  {...register('nombre', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
                />
                {errors.nombre && <div className="mk-ferror">{errors.nombre.message}</div>}
              </div>
              <div className="mk-fgroup">
                <label className="mk-flabel">Bio</label>
                <textarea
                  className="mk-ftextarea"
                  placeholder="Cuéntanos algo sobre ti..."
                  {...register('bio')}
                />
              </div>
              {saveError && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 8 }}>{saveError}</div>}
              <button type="submit" className="mk-fbtn" style={{ marginTop: 16 }} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          ) : (
            <div style={{ maxWidth: 500 }}>
              <div className="mk-data-label">Nombre</div>
              <div className="mk-data-value">{user?.nombre}</div>
              <div className="mk-data-label">Email</div>
              <div className="mk-data-value">{user?.email}</div>
              {user?.bio && (
                <>
                  <div className="mk-data-label">Bio</div>
                  <div className="mk-data-value">{user.bio}</div>
                </>
              )}
              {user?.created_at && (
                <>
                  <div className="mk-data-label">Miembro desde</div>
                  <div className="mk-data-value">{new Date(user.created_at).toLocaleDateString('es-CL')}</div>
                </>
              )}
            </div>
          )
        )}

        {activeTab === 'publicaciones' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: '#bbb', letterSpacing: 1 }}>Productos que has publicado</div>
              <button className="mk-nav-cta" onClick={() => navigate('/mis-publicaciones')}>
                Ver todas →
              </button>
            </div>
            <button className="mk-btn-dark" style={{ maxWidth: 260 }} onClick={() => navigate('/publicaciones/nueva')}>
              + Publicar nuevo café
            </button>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div>
            <div style={{ fontSize: 11, color: '#bbb', letterSpacing: 1, marginBottom: 24 }}>Historial de compras</div>
            <button className="mk-btn-outline" style={{ maxWidth: 260 }} onClick={() => navigate('/pedidos')}>
              Ver mis pedidos →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Profile
