/**
 * CartItem.tsx
 *
 * Single cart line item rendered as a <li>.
 * Layout mirrors Shopping_cart.html reference:
 *   Left:  product name (truncated) + quantity badge "x{n}" in violet
 *   Right: subtotal "$X.XXX" + unit price "à $X.XXX" in smaller text
 *
 * Selected state: violet border + subtle violet background (RNF-14)
 * Accessibility: role="option", aria-selected (Req-3 3.1)
 *
 * Requisitos: Req-3 (3.1, 3.3, 3.4), RNF-14
 */

import type { CartItem as CartItemType } from '../../types/pos.types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a price as Colombian pesos: $X.XXX
 * Uses es-CO locale with no decimal places for whole numbers.
 */
function formatPrice(value: number): string {
  return (
    '$' +
    value.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  )
}

/**
 * Format quantity: integer if whole number, 3 decimals for weight products.
 */
function formatQuantity(cantidad: number, unidad: string): string {
  const isWeight = ['kg', 'g', 'lb'].includes(unidad)
  if (isWeight) {
    return cantidad.toLocaleString('es-CO', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })
  }
  return Math.round(cantidad).toString()
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CartItemProps {
  item: CartItemType
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CartItem({ item, isSelected, onSelect, onRemove }: CartItemProps) {
  const quantityLabel = formatQuantity(item.cantidad, item.unidad_medida)
  const subtotalFormatted = formatPrice(item.subtotal)
  const unitPriceFormatted = formatPrice(item.precio)

  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={[
        'flex items-start justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
        'select-none',
        isSelected
          ? 'border border-violet-500/70 bg-violet-500/10'
          : 'border border-white/10 hover:bg-white/5',
      ].join(' ')}
    >
      {/* ── Left: name + quantity badge ─────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white text-sm font-medium truncate leading-snug">
          {item.nombre}
          {' '}
          <span className="text-violet-400 text-xs font-semibold whitespace-nowrap">
            x{quantityLabel}
          </span>
        </h3>
        {/* Unit of measure hint for weight products */}
        {['kg', 'g', 'lb'].includes(item.unidad_medida) && (
          <span className="text-white/40 text-xs">{item.unidad_medida}</span>
        )}
      </div>

      {/* ── Right: subtotal + unit price ────────────────────────────── */}
      <div className="text-right shrink-0">
        <span className="block text-white text-sm font-semibold">
          {subtotalFormatted}
        </span>
        <span className="text-white/50 text-xs">
          à {unitPriceFormatted}
        </span>
      </div>

      {/* ── Remove button ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation() // don't trigger onSelect
          onRemove()
        }}
        className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm leading-none"
        aria-label={`Eliminar ${item.nombre}`}
        title="Eliminar ítem"
        tabIndex={-1}
      >
        ×
      </button>
    </li>
  )
}
