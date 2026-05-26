import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginApi } from '../api/auth.api'

// ---------------------------------------------------------------------------
// Demo credentials for quick access during development
// ---------------------------------------------------------------------------
const DEMO_USERS = [
  { label: 'Admin', username: 'admin', password: 'admin123', color: 'from-violet-600 to-purple-600' },
  { label: 'Supervisor', username: 'supervisor', password: 'super123', color: 'from-blue-600 to-cyan-600' },
  { label: 'Cajero', username: 'cajero', password: 'cajero123', color: 'from-emerald-600 to-teal-600' },
]

// Zod schema — both fields required, min 1 char
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Fill form with demo credentials
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
      navigate('/pos')
    } catch (err: unknown) {
      // Extract HTTP status from Axios error shape
      const status =
        err !== null &&
        typeof err === 'object' &&
        'response' in err &&
        err.response !== null &&
        typeof err.response === 'object' &&
        'status' in err.response
          ? (err.response as { status: number }).status
          : undefined
      setServerError(getErrorMessage(status))
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-violet-600 to-purple-600 mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">POS Supermercado</h1>
          <p className="text-white/60 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Username field */}
          <div className="mb-5">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white/80 mb-1.5"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              className={`glass-input w-full rounded-lg px-4 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-violet-500 transition-all ${
                errors.username ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="Ingresa tu usuario"
              {...register('username')}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-400" role="alert">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/80 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`glass-input w-full rounded-lg px-4 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-violet-500 transition-all ${
                errors.password ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="Ingresa tu contraseña"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server error alert */}
          {serverError && (
            <div
              className="mb-5 rounded-lg px-4 py-3 bg-red-500/20 border border-red-500/40 text-red-300 text-sm"
              role="alert"
              aria-live="assertive"
            >
              <span className="font-medium">⚠ </span>
              {serverError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner w-5 h-5 inline-block"
                  role="status"
                  aria-label="Cargando"
                />
                <span>Iniciando sesión…</span>
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* ── Quick access (dev helper) ─────────────────────────────── */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-center text-xs text-white/30 mb-3 uppercase tracking-wider">
            Acceso rápido (demo)
          </p>
          <div className="flex gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.username}
                type="button"
                onClick={() => fillDemo(u.username, u.password)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-linear-to-r ${u.color} opacity-70 hover:opacity-100 transition-opacity`}
                title={`Usuario: ${u.username} / Contraseña: ${u.password}`}
              >
                {u.label}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-white/20 mt-2">
            Haz clic para rellenar las credenciales
          </p>
        </div>
      </div>
    </div>
  )
}
