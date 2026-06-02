/**
 * CartSummary.tsx — Resumen de totales + botón F6 Cobrar
 * Requisitos: Req-3 (3.2, 3.9), Req-6 (6.8)
 */

import type { MetodoPago, Totales } from '../../types/pos.types'

function fmt(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const METODO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia',
}

interface CartSummaryProps {
  totales: Totales
  itemCount: number
  metodoPago: MetodoPago | null
  onCobrar: () => void
}

export default function CartSummary({ totales, itemCount, metodoPago, onCobrar }: CartSummaryProps) {
  const isEmpty = itemCount === 0
  const { subtotalSinIVA, montoIVA, totalConIVA, descuentoMonto } = totales

  return (
    <div className="card flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Resumen
      </p>

      {/* Filas */}
      <div className="space-y-2.5">
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal sin IVA</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{fmt(subtotalSinIVA)}</span>
        </div>

        {descuentoMonto > 0 && (
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--warning)' }}>Descuento</span>
            <span style={{ color: 'var(--warning)', fontWeight: 500 }}>-{fmt(descuentoMonto)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>IVA (19%)</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{fmt(montoIVA)}</span>
        </div>

        <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Total</span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(totalConIVA)}</span>
        </div>
      </div>

      {/* Método de pago badge */}
      {metodoPago && (
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Método:</span>
          <span className="badge-accent">{METODO_LABEL[metodoPago]}</span>
        </div>
      )}

      {/* Botón F6 */}
      <button
        type="button" onClick={onCobrar} disabled={isEmpty}
        aria-label={isEmpty ? 'Cobrar — carrito vacío' : 'Cobrar (F6)'}
        className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all"
        style={isEmpty ? {
          opacity: 0.4, cursor: 'not-allowed',
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-muted)', border: '1px solid var(--border)',
        } : {
          backgroundColor: 'var(--accent)', color: '#fff',
          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
        }}
      >
        <span className="key" style={isEmpty ? { opacity: 0.5 } : { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>F6</span>
        Cobrar
      </button>

      {isEmpty && (
        <p className="text-center text-xs -mt-2" style={{ color: 'var(--text-muted)' }}>
          Agrega productos para cobrar
        </p>
      )}
    </div>
  )
}
