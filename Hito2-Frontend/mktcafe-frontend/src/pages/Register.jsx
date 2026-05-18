import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register: registerUser, error } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    const success = await registerUser(data.nombre, data.email, data.password, data.foto_url)
    if (success) navigate('/perfil')
  }

  return (
    <div className="mk-form-page">
      {/* Panel oscuro */}
      <div className="mk-hero" style={{ padding: '60px 40px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="mk-hero-tag" style={{ textAlign: 'left', marginBottom: 30 }}>★ &nbsp; Únete a la comunidad &nbsp; ★</div>
        <h2 className="mk-hero-title" style={{ fontSize: 36, letterSpacing: -1, marginBottom: 16 }}>Comienza tu<br />viaje cafetalero.</h2>
        <p style={{ fontSize: 12, color: '#666', lineHeight: 1.8, position: 'relative' }}>
          Crea tu cuenta gratis y empieza a comprar o vender café artesanal de todo Chile.
        </p>
      </div>

      {/* Formulario */}
      <div className="mk-form-panel">
        <div className="mk-form-label">Nueva cuenta</div>
        <div className="mk-form-heading">Regístrate</div>

        {error && <div className="mk-ferror-alert">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mk-fgroup">
            <label className="mk-flabel">Nombre completo</label>
            <input
              type="text"
              className={`mk-finput${errors.nombre ? ' mk-error' : ''}`}
              placeholder="Ej: María González"
              {...register('nombre', {
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
            />
            {errors.nombre && <div className="mk-ferror">{errors.nombre.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">Correo electrónico</label>
            <input
              type="email"
              className={`mk-finput${errors.email ? ' mk-error' : ''}`}
              placeholder="ejemplo@correo.com"
              {...register('email', {
                required: 'El email es obligatorio',
                pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' },
              })}
            />
            {errors.email && <div className="mk-ferror">{errors.email.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">Contraseña</label>
            <input
              type="password"
              className={`mk-finput${errors.password ? ' mk-error' : ''}`}
              placeholder="••••••••"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            {errors.password && <div className="mk-ferror">{errors.password.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">Confirmar contraseña</label>
            <input
              type="password"
              className={`mk-finput${errors.confirmPassword ? ' mk-error' : ''}`}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (val) => val === password || 'Las contraseñas no coinciden',
              })}
            />
            {errors.confirmPassword && <div className="mk-ferror">{errors.confirmPassword.message}</div>}
          </div>

          <div className="mk-fgroup">
            <label className="mk-flabel">Foto de perfil (opcional)</label>
            <input
              type="url"
              className="mk-finput"
              placeholder="https://..."
              {...register('foto_url')}
            />
          </div>

          <button type="submit" className="mk-fbtn" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mk-flink">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </div>
        <div className="mk-flink" style={{ marginTop: 8 }}>
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
