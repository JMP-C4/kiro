import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ui/ThemeToggle'
import type { Rol } from '../types/auth.types'

const ROL_LABEL: Record<Rol, string> = {
  CAJERO: 'Cajero',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Administrador',
}

interface ModuleCard {
  path: string
  label: string
  description: string
  icon: string
  roles: Rol[]
}

const MODULES: ModuleCard[] = [
  { path: '/pos',          label: 'Punto de Venta',  description: 'Registrar ventas y procesar pagos',       icon: '🧾', roles: ['CAJERO','SUPERVISOR','ADMIN'] },
  { path: '/productos',    label: 'Productos',        description: 'Gestionar catálogo de productos',         icon: '📦', roles: ['SUPERVISOR','ADMIN'] },
  { path: '/usuarios',     label: 'Usuarios',         description: 'Administrar usuarios y permisos',         icon: '👥', roles: ['ADMIN'] },
  { path: '/reportes',     label: 'Reportes',         description: 'Ver ventas y estadísticas por período',   icon: '📊', roles: ['SUPERVISOR','ADMIN'] },
  { path: '/configuracion',label: 'Configuración',    description: 'Parámetros del sistema, IVA y formato',   icon: '⚙️', roles: ['ADMIN'] },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { nombre, rol, logout } = useAuth()

  const visible = MODULES.filter(m => rol && m.roles.includes(rol))

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Navbar */}
      <header className="navbar">
        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          POS Supermercado
        </span>
        <div className="flex-1" />
        {nombre && rol && (
          <div className="hidden md:flex flex-col items-end leading-tight mr-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{nombre}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ROL_LABEL[rol]}</span>
          </div>
        )}
        <ThemeToggle />
        <button
          type="button"
          onClick={() => { logout(); navigate('/login') }}
          className="btn-secondary text-sm py-1.5 px-3"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6">

        {/* Saludo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Bienvenido{nombre ? `, ${nombre.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {rol ? ROL_LABEL[rol] : ''} — selecciona un módulo para comenzar
          </p>
        </div>

        {/* Grid de módulos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(mod => (
            <button
              key={mod.path}
              type="button"
              onClick={() => navigate(mod.path)}
              className="card-hover text-left group"
            >
              <div className="flex items-start gap-4">
                <span
                  className="text-2xl flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  {mod.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {mod.label}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {mod.description}
                  </p>
                </div>
              </div>
              <div
                className="mt-4 flex items-center text-xs font-medium gap-1 transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                Abrir →
              </div>
            </button>
          ))}
        </div>

      </main>
    </div>
  )
}
