/**
 * Reportes.tsx — Módulo de reportes de ventas (SUPERVISOR y ADMIN)
 *
 * Req-10 (10.3, 10.4, 10.6)
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getReporteVentas } from '../api/reportes.api'
import type { VentaResponse } from '../types/venta.types'
import Spinner from '../components/ui/Spinner'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function startOfWeek(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // lunes
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

function startOfMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
}

const METODO_COLOR: Record<string, string> = {
  EFECTIVO: 'bg-emerald-500/20 text-emerald-400',
  TARJETA: 'bg-blue-500/20 text-blue-400',
  TRANSFERENCIA: 'bg-violet-500/20 text-violet-400',
}

type Periodo = 'hoy' | 'semana' | 'mes' | 'personalizado'

// ---------------------------------------------------------------------------
// Bento card
// ---------------------------------------------------------------------------

function BentoCard({
  label,
  value,
  sub,
  color = 'violet',
}: {
  label: string
  value: string
  sub?: string
  color?: 'violet' | 'emerald' | 'blue' | 'amber'
}) {
  const ring: Record<string, string> = {
    violet: 'ring-violet-500/30',
    emerald: 'ring-emerald-500/30',
    blue: 'ring-blue-500/30',
    amber: 'ring-amber-500/30',
  }
  const text: Record<string, string> = {
    violet: 'text-violet-300',
    emerald: 'text-emerald-300',
    blue: 'text-blue-300',
    amber: 'text-amber-300',
  }
  return (
    <div className={`glass-card p-5 ring-1 ${ring[color]}`}>
      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${text[color]}`}>{value}</p>
      {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Reportes() {
  const { nombre, rol } = useAuth()
  const navigate = useNavigate()

  const [periodo, setPeriodo] = useState<Periodo>('hoy')
  const [desde, setDesde] = useState(today())
  const [hasta, setHasta] = useState(today())
  const [ventaExpandida, setVentaExpandida] = useState<string | null>(null)

  // Calcular rango según período seleccionado
  const rango = useMemo(() => {
    switch (periodo) {
      case 'hoy':     return { desde: today(), hasta: today() }
      case 'semana':  return { desde: startOfWeek(), hasta: today() }
      case 'mes':     return { desde: startOfMonth(), hasta: today() }
      case 'personalizado': return { desde, hasta }
    }
  }, [periodo, desde, hasta])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reportes', rango.desde, rango.hasta],
    queryFn: () => getReporteVentas(rango.desde, rango.hasta),
    staleTime: 60_000,
  })

  // Desglose por método de pago
  const desglose = data?.desglose_por_metodo ?? {}
  const metodosOrden = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']

  const periodoLabel: Record<Periodo, string> = {
    hoy: 'Hoy',
    semana: 'Esta semana',
    mes: 'Este mes',
    personalizado: 'Personalizado',
  }

  const btnPeriodo = (p: Periodo) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      periodo === p
        ? 'bg-violet-600 text-white'
        : 'text-white/60 hover:text-white hover:bg-white/10'
    }`

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass h-14 flex items-center px-6 gap-4 sticky top-0 z-40">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-white/60 hover:text-white transition text-sm"
        >
          ← Dashboard
        </button>
        <span className="text-white font-bold text-base flex-1">Reportes de Ventas</span>
        {nombre && (
          <span className="text-white/60 text-sm hidden md:block">
            {nombre} · {rol}
          </span>
        )}
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Filtros de período — Req-10 (10.3) */}
        <div className="glass-card p-4 flex flex-wrap items-center gap-3">
          <span className="text-white/60 text-sm font-medium">Período:</span>
          <div className="flex gap-1 flex-wrap">
            {(['hoy', 'semana', 'mes', 'personalizado'] as Periodo[]).map((p) => (
              <button key={p} type="button" className={btnPeriodo(p)} onClick={() => setPeriodo(p)}>
                {periodoLabel[p]}
              </button>
            ))}
          </div>

          {/* Rango personalizado */}
          {periodo === 'personalizado' && (
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <input
                type="date"
                value={desde}
                max={hasta}
                onChange={(e) => setDesde(e.target.value)}
                className="glass-input rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/60"
              />
              <span className="text-white/40 text-sm">→</span>
              <input
                type="date"
                value={hasta}
                min={desde}
                max={today()}
                onChange={(e) => setHasta(e.target.value)}
                className="glass-input rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/60"
              />
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition"
              >
                Buscar
              </button>
            </div>
          )}

          {/* Rango activo */}
          {periodo !== 'personalizado' && (
            <span className="ml-auto text-white/40 text-xs">
              {rango.desde === rango.hasta ? rango.desde : `${rango.desde} → ${rango.hasta}`}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className="glass-card p-6 text-center text-red-400">
            Error al cargar el reporte. Verifica la conexión con el backend.
          </div>
        )}

        {data && (
          <>
            {/* Bento cards resumen — Req-10 (10.4) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BentoCard
                label="Total ventas"
                value={String(data.total_ventas)}
                sub={periodoLabel[periodo].toLowerCase()}
                color="violet"
              />
              <BentoCard
                label="Monto total"
                value={formatCurrency(data.monto_total)}
                color="emerald"
              />
              <BentoCard
                label="Efectivo"
                value={formatCurrency(desglose['EFECTIVO'] ?? 0)}
                color="blue"
              />
              <BentoCard
                label="Tarjeta / Transferencia"
                value={formatCurrency((desglose['TARJETA'] ?? 0) + (desglose['TRANSFERENCIA'] ?? 0))}
                color="amber"
              />
            </div>

            {/* Desglose por método de pago */}
            {Object.keys(desglose).length > 0 && (
              <div className="glass-card p-5">
                <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
                  Desglose por método de pago
                </h2>
                <div className="flex flex-wrap gap-4">
                  {metodosOrden.filter((m) => desglose[m] != null).map((metodo) => (
                    <div key={metodo} className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${METODO_COLOR[metodo] ?? 'bg-white/10 text-white/60'}`}>
                        {METODO_LABEL[metodo] ?? metodo}
                      </span>
                      <span className="text-white font-semibold text-sm">
                        {formatCurrency(desglose[metodo])}
                      </span>
                      {data.monto_total > 0 && (
                        <span className="text-white/40 text-xs">
                          ({Math.round((desglose[metodo] / data.monto_total) * 100)}%)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabla de ventas individuales — Req-10 (10.4) */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                  Ventas del período
                </h2>
                <span className="text-white/40 text-xs">{data.ventas.length} registros</span>
              </div>

              {data.ventas.length === 0 ? (
                <p className="text-center text-white/40 py-12 text-sm">
                  No hay ventas en el período seleccionado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">N° Venta</th>
                        <th className="text-left px-4 py-3">Fecha</th>
                        <th className="text-left px-4 py-3">Cajero</th>
                        <th className="text-center px-4 py-3">Método</th>
                        <th className="text-right px-4 py-3">Total</th>
                        <th className="text-center px-4 py-3">Ítems</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.ventas.map((venta: VentaResponse) => {
                        const ventaId = venta.numero_venta ?? String(venta.id)
                        const isExpanded = ventaExpandida === ventaId
                        return (
                          <>
                            <tr
                              key={ventaId}
                              className="text-white/80 hover:bg-white/5 transition-colors cursor-pointer"
                              onClick={() => setVentaExpandida(isExpanded ? null : ventaId)}
                            >
                              <td className="px-4 py-3 font-mono text-xs text-violet-300">
                                {venta.numero_venta}
                              </td>
                              <td className="px-4 py-3 text-white/60 text-xs">
                                {formatDate(venta.created_at)}
                              </td>
                              <td className="px-4 py-3 text-white/80">
                                {venta.cajero_nombre}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${METODO_COLOR[venta.metodo_pago] ?? 'bg-white/10 text-white/60'}`}>
                                  {METODO_LABEL[venta.metodo_pago] ?? venta.metodo_pago}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-white">
                                {formatCurrency(venta.total_con_iva)}
                              </td>
                              <td className="px-4 py-3 text-center text-white/50 text-xs">
                                {venta.items?.length ?? 0} {isExpanded ? '▲' : '▼'}
                              </td>
                            </tr>

                            {/* Detalle expandible de ítems */}
                            {isExpanded && venta.items && venta.items.length > 0 && (
                              <tr key={`${ventaId}-detail`} className="bg-white/5">
                                <td colSpan={6} className="px-6 py-3">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-white/40 uppercase tracking-wider">
                                        <th className="text-left py-1">Producto</th>
                                        <th className="text-center py-1">Cant.</th>
                                        <th className="text-right py-1">P. Unit.</th>
                                        <th className="text-right py-1">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {venta.items.map((item, idx) => (
                                        <tr key={idx} className="text-white/70">
                                          <td className="py-1">{item.nombre_producto}</td>
                                          <td className="py-1 text-center">{item.cantidad}</td>
                                          <td className="py-1 text-right">{formatCurrency(item.precio_unitario)}</td>
                                          <td className="py-1 text-right font-medium text-white">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className="mt-2 pt-2 border-t border-white/10 flex justify-end gap-6 text-xs text-white/60">
                                    <span>Subtotal sin IVA: <strong className="text-white">{formatCurrency(venta.subtotal_sin_iva)}</strong></span>
                                    <span>IVA: <strong className="text-white">{formatCurrency(venta.iva_monto)}</strong></span>
                                    <span>Total: <strong className="text-violet-300 text-sm">{formatCurrency(venta.total_con_iva)}</strong></span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
