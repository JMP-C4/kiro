/**
 * CartItem.tsx — Línea individual del carrito
 * Requisitos: Req-3 (3.1, 3.3, 3.4), RNF-14
 */

import type { CartItem as CartItemType } from '../../types/pos.types'

function formatPrice(v: number): string {
  return '$' + v.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatQty(cantidad: number, unidad: string): string {
  const isWeight = ['kg', 'g', 'lb'].includes(unidad)
  return isWeight
    ? cantidad.toLocaleString('es-CO', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
    : Math.round(cantidad).toString()
}

interface CartItemProps {
  item: CartItemType
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

export default function CartItem({ item, isSelected, onSelect, onRemove }: CartItemProps) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer select-none transition-all"
      style={isSelected ? {
        backgroundColor: 'var(--accent-light)',
        border: '1px solid rgba(99,102,241,0.5)',
      } : {
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Nombre + cantidad */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block truncate" style={{ color: 'var(--text-primary)' }}>
          {item.nombre}
        </span>
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
          × {formatQty(item.cantidad, item.unidad_medida)}
          {['kg','g','lb'].includes(item.unidad_medida) && (
            <span className="ml-0.5 font-normal" style={{ color: 'var(--text-muted)' }}>{item.unidad_medida}</span>
          )}
        </span>
      </div>

      {/* Precios */}
      <div className="text-right shrink-0">
        <span className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {formatPrice(item.subtotal)}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          à {formatPrice(item.precio)}
        </span>
      </div>

      {/* Eliminar */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onRemove() }}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-lg leading-none transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        aria-label={`Eliminar ${item.nombre}`}
        tabIndex={-1}
      >
        ×
      </button>
    </li>
  )
}
