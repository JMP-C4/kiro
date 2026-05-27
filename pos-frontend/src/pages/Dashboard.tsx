/**
 * Dashboard.tsx — Panel principal post-login
 *
 * Muestra progreso de implementación frontend y acceso rápido a módulos.
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BentoCard from '../components/admin/BentoCard'
import ThemeToggle from '../components/ui/ThemeToggle'
import {
  FRONTEND_TASKS,
  MODULE_LINKS,
  getProgressStats,
  type TaskStatus,
} from '../lib/projectProgress'
import type { Rol } from '../types/auth.types'

const ROL_LABEL: Record<Rol, string> = {
  CAJERO: 'Cajero',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Administrador',
}

const STATUS_STYLE: Record<TaskStatus, { label: string; className: string }> = {
  done: { label: 'Completo', className: 'bg-emerald-500/20 text-emerald-400' },
  partial: { label: 'Parcial', className: 'bg-amber-500/20 text-amber-400' },
  pending: { label: 'Pendiente', className: 'bg-white/10 text-white/40' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { nombre, rol, logout } = useAuth()
  const stats = getProgressStats()

  const visibleModules = MODULE_LINKS.filter(
    (m) => rol && m.roles.includes(rol)
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="glass h-14 flex items-center px-6 gap-4 sticky top-0 z-40">
        <span className="text-white font-bold text-base flex-1">POS Supermercado</span>
        {nombre && rol && (
          <span className="text-white/60 text-sm hidden md:block">
            {nombre} · {ROL_LABEL[rol]}
          </span>
        )}
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg glass hover:bg-red-500/30 transition text-sm text-white/80 hover:text-white"
        >
          Salir
        </button>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Welcome + progress summary */}
        <section>
          <h1 className="text-2xl font-bold text-white">
            Bienvenido{nombre ? `, ${nombre.split(' ')[0]}` : ''}
          </h1>
          <p className="text-white/50 mt-1">
            Progreso del frontend — spec supermarket-pos
          </p>

          <div className="glass-card p-6 mt-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-4xl font-bold text-white">{stats.percent}%</p>
                <p className="text-white/50 text-sm mt-1">
                  {stats.done} completadas · {stats.partial} parciales · {stats.pending} pendientes
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  {stats.done} ✓
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">
                  {stats.partial} ~
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/40">
                  {stats.pending} …
                </span>
              </div>
            </div>

            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-violet-600 to-emerald-500 transition-all duration-700"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Quick access modules */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Módulos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleModules.map((mod) => (
              <BentoCard
                key={mod.path}
                title={mod.label}
                description={mod.description}
                icon={mod.icon}
                disabled={!mod.ready}
                onClick={() => navigate(mod.path)}
              >
                {!mod.ready && (
                  <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    En construcción
                  </span>
                )}
              </BentoCard>
            ))}
          </div>
        </section>

        {/* Task checklist */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Tareas frontend (.kiro)</h2>
          <div className="glass-card overflow-hidden">
            <ul className="divide-y divide-white/5">
              {FRONTEND_TASKS.map((task) => {
                const style = STATUS_STYLE[task.status]
                return (
                  <li
                    key={task.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xs font-mono text-white/30 w-8 shrink-0">
                      {task.id}
                    </span>
                    <span className="text-xs text-violet-400/70 w-16 shrink-0 hidden sm:block">
                      {task.phase}
                    </span>
                    <span className="text-sm text-white/80 flex-1">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${style.className}`}>
                      {style.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
