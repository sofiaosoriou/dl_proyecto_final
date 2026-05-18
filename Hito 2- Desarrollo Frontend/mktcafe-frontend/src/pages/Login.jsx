import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password)
    if (success) navigate('/perfil')
  }

  return (
    <div className="mk-form-page">
      {/* Panel oscuro */}
      <div className="mk-hero" style={{ padding: '60px 40px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="mk-hero-tag" style={{ textAlign: 'left', marginBottom: 24 }}>★ &nbsp; Bienvenido de vuelta &nbsp; ★</div>
        <h2 className="mk-hero-title" style={{ fontSize: 36, letterSpacing: -1, marginBottom: 16 }}>Tu café<br />te espera.</h2>
        <p style={{ fontSize: 12, color: '#666', lineHeight: 1.8, position: 'relative' }}>
          Ingresa a tu cuenta y continúa explorando el mejor café artesanal de Chile.
        </p>
      </div>

      {/* Formulario */}
      <div className="mk-form-panel">
        <div className="mk-form-label">Tu cuenta</div>
        <div className="mk-form-heading">Iniciar Sesión</div>

        {error && <div className="mk-ferror-alert">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

          <button type="submit" className="mk-fbtn" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mk-flink">
          ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
        </div>
        <div className="mk-flink" style={{ marginTop: 8 }}>
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
