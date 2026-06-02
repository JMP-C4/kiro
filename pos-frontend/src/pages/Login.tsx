import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginApi } from '../api/auth.api'
import ThemeToggle from '../components/ui/ThemeToggle'

const DEMO_USERS = [
  { label: 'Admin',      username: 'admin',      password: 'admin123'    },
  { label: 'Supervisor', username: 'supervisor',  password: 'super123'    },
  { label: 'Cajero',     username: 'cajero',      password: 'cajero123'   },
]

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})
type LoginFormData = z.infer<typeof loginSchema>

function getErrorMessage(status: number | undefined): string {
  if (status === 401) return 'Credenciales inválidas. Verifica tu usuario y contraseña.'
  if (status === 403) return 'Usuario inactivo. Contacta al administrador.'
  return 'Error al conectar con el servidor.'
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const fillDemo = (username: string, password: string) => {
    setValue('username', username, { shouldValidate: true })
    setValue('password', password, { shouldValidate: true })
    setServerError(null)
  }

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      const { token, rol, nombre } = await loginApi(data.username, data.password)
      login(token, rol, nombre)
      navigate('/dashboard')
    } catch (err: unknown) {
      const status =
        err !== null && typeof err === 'object' && 'response' in err &&
        err.response !== null && typeof err.response === 'object' && 'status' in err.response
          ? (err.response as { status: number }).status : undefined
      setServerError(getErrorMessage(status))
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Toggle de tema en esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">

        {/* Logo + título */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: 'var(--accent)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>POS Supermercado</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Inicia sesión para continuar</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Usuario */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}>
                Usuario
              </label>
              <input
                id="username" type="text" autoComplete="username" autoFocus
                className={`field ${errors.username ? 'field-error' : ''}`}
                placeholder="tu.usuario"
                {...register('username')}
              />
              {errors.username && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }} role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}>
                Contraseña
              </label>
              <input
                id="password" type="password" autoComplete="current-password"
                className={`field ${errors.password ? 'field-error' : ''}`}
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }} role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error servidor */}
            {serverError && (
              <div className="alert-error mb-4 flex items-start gap-2" role="alert" aria-live="assertive">
                <span>⚠</span><span>{serverError}</span>
              </div>
            )}

            {/* Botón submit */}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5">
              {isSubmitting
                ? <><span className="spinner w-4 h-4" role="status" aria-label="Cargando" /> Iniciando sesión…</>
                : 'Iniciar sesión'}
            </button>
          </form>

          {/* Acceso rápido demo */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-center text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Acceso rápido (demo)
            </p>
            <div className="flex gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.username} type="button"
                  onClick={() => fillDemo(u.username, u.password)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-light)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
                  }}
                  title={`${u.username} / ${u.password}`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
