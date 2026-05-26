/**
 * CartSummary.tsx
 *
 * Resumen de totales del carrito: subtotal sin IVA, descuento (si aplica),
 * IVA 19% y total con IVA. Incluye el botón "F6 — Cobrar".
 *
 * Estructura basada en Shopping_cart.html:
 *   - Sección de totales con filas justify-between
 *   - Línea divisoria antes del total
 *   - Botón de checkout al final
 *
 * Requisitos: Req-3 (3.2, 3.9), Req-6 (6.8)
 */

import type { MetodoPago, Totales } from '../../types/pos.types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formatea un valor como pesos colombianos: $X.XXX
 * Usa locale es-CO sin decimales para valores enteros.
 */
function formatPeso(value: number): string {
  return (
    '$' +
    Math.round(value).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  )
}

/** Etiqueta legible para el método de pago */
const METODO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CartSummaryProps {
  /** Totales calculados por calcularTotales() */
  totales: Totales
  /** Número de ítems en el carrito — deshabilita F6 si es 0 */
  itemCount: number
  /** Método de pago seleccionado (null si no se ha elegido) */
  metodoPago: MetodoPago | null
  /** Callback al pulsar el botón F6 Cobrar */
  onCobrar: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CartSummary({
  totales,
  itemCount,
  metodoPago,
  onCobrar,
}: CartSummaryProps) {
  const isEmpty = itemCount === 0
  const { subtotalSinIVA, montoIVA, totalConIVA, descuentoMonto } = totales

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      {/* ── Título ──────────────────────────────────────────────────── */}
      <h2 className="text-white/80 text-xs font-semibold uppercase tracking-wider">
        Resumen
      </h2>

      {/* ── Filas de totales ────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Subtotal sin IVA */}
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Subtotal sin IVA</span>
          <span className="text-white text-sm font-medium">
            {formatPeso(subtotalSinIVA)}
          </span>
        </div>

        {/* Descuento — solo visible cuando descuentoMonto > 0 */}
        {descuentoMonto > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-amber-400/80 text-sm">Descuento</span>
            <span className="text-amber-400 text-sm font-medium">
              -{formatPeso(descuentoMonto)}
            </span>
          </div>
        )}

        {/* IVA 19% */}
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">IVA (19%)</span>
          <span className="text-white text-sm font-medium">
            {formatPeso(montoIVA)}
          </span>
        </div>

        {/* Divisor */}
        <div className="border-t border-white/15 pt-2">
          {/* Total con IVA — destacado */}
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold text-base">Total</span>
            <span className="text-white font-bold text-lg">
              {formatPeso(totalConIVA)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Badge método de pago ────────────────────────────────────── */}
      {metodoPago && (
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-xs">Método:</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            {METODO_LABEL[metodoPago]}
          </span>
        </div>
      )}

      {/* ── Botón F6 Cobrar ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onCobrar}
        disabled={isEmpty}
        aria-disabled={isEmpty}
        aria-label={isEmpty ? 'Cobrar — carrito vacío' : 'Cobrar (F6)'}
        className={[
          'w-full mt-1 py-2.5 px-4 rounded-xl text-sm font-semibold',
          'flex items-center justify-center gap-2',
          'transition-all duration-150',
          isEmpty
            ? 'opacity-50 cursor-not-allowed bg-white/10 text-white/40'
            : [
                'bg-linear-to-r from-violet-600 to-violet-500',
                'text-white shadow-lg shadow-violet-500/25',
                'hover:from-violet-500 hover:to-violet-400',
                'hover:shadow-violet-500/40',
                'active:scale-[0.98]',
              ].join(' '),
        ].join(' ')}
      >
        <kbd
          className={[
            'inline-flex items-center justify-center',
            'px-1.5 py-0.5 rounded text-xs font-mono',
            isEmpty
              ? 'bg-white/10 text-white/30'
              : 'bg-white/20 text-white',
          ].join(' ')}
          aria-hidden="true"
        >
          F6
        </kbd>
        <span>Cobrar</span>
      </button>

      {/* Hint cuando el carrito está vacío — Req-6 (6.8) */}
      {isEmpty && (
        <p className="text-white/30 text-xs text-center -mt-1">
          Agrega productos para cobrar
        </p>
      )}
    </div>
  )
}
