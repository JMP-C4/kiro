/**
 * CartList.tsx
 *
 * Renders the shopping cart as a <ul role="listbox"> containing CartItem components.
 * Mirrors the Shopping_cart.html reference structure: ul > li flex items-start justify-between.
 *
 * Features:
 *   - Empty state: cart icon + "El carrito está vacío" message
 *   - Auto-scroll: selected item scrolls into view when selectedIndex changes
 *   - Keyboard navigation (↑↓, Del) is handled by the parent POS via useKeyboardShortcuts
 *
 * Requisitos: Req-3 (3.1, 3.3, 3.4), RNF-14
 */

import { useEffect, useRef } from 'react'
import type { CartItem as CartItemType } from '../../types/pos.types'
import CartItem from './CartItem'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CartListProps {
  items: CartItemType[]
  selectedIndex: number | null
  onSelectItem: (index: number) => void
  onRemoveItem: (lineId: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CartList({
  items,
  selectedIndex,
  onSelectItem,
  onRemoveItem,
}: CartListProps) {
  const listRef = useRef<HTMLUListElement>(null)

  // Auto-scroll selected item into view — Req-3 (3.3), RNF-14
  useEffect(() => {
    if (selectedIndex === null || !listRef.current) return
    const listEl = listRef.current
    const selectedEl = listEl.children[selectedIndex] as HTMLElement | undefined
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  // ── Empty state ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 min-h-48 text-white/20"
        aria-label="Carrito de compras vacío"
      >
        {/* Cart icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="w-14 h-14 mb-3 opacity-30"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
        <p className="text-sm">El carrito está vacío</p>
      </div>
    )
  }

  // ── Cart items list ──────────────────────────────────────────────────────
  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Carrito de compras"
      className="space-y-2 overflow-y-auto flex-1"
    >
      {items.map((item, index) => (
        <CartItem
          key={item.lineId}
          item={item}
          isSelected={selectedIndex === index}
          onSelect={() => onSelectItem(index)}
          onRemove={() => onRemoveItem(item.lineId)}
        />
      ))}
    </ul>
  )
}
