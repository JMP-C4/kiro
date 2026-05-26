/**
 * OverflowMenu — Req-7 (7.2), RF-20
 *
 * Dropdown glassmorphism activado con la tecla M.
 * Muestra los atajos secundarios con descripción.
 * Navegación con ↑↓ dentro del menú.
 *
 * Requisitos: Req-7 (7.2)
 */

import { useEffect, useRef, useState } from 'react'

interface OverflowMenuProps {
  /** Controlled open state — synced with M keyboard shortcut in POS */
  open?: boolean
  onToggle?: () => void
}

interface MenuItem {
  key: string
  label: string
  description: string
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'F4', label: 'IVA / Descuento', description: 'Ver desglose de IVA y aplicar descuento global' },
  { key: 'F5', label: 'Método de pago', description: 'Seleccionar Efectivo, Tarjeta o Transferencia' },
  { key: 'F7', label: 'Imprimir ticket', description: 'Imprimir el ticket de la venta actual' },
  { key: 'F8', label: 'Nueva venta', description: 'Limpiar carrito e iniciar nueva venta' },
  { key: '↑↓', label: 'Navegar carrito', description: 'Mover selección entre ítems del carrito' },
  { key: 'Del', label: 'Eliminar ítem', description: 'Eliminar el ítem seleccionado del carrito' },
  { key: 'Esc', label: 'Cerrar modal', description: 'Cerrar cualquier modal abierto' },
]

export default function OverflowMenu({ open, onToggle }: OverflowMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const isOpen = open !== undefined ? open : internalOpen

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalOpen((prev) => !prev)
    }
    setFocusedIndex(0)
  }

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        if (onToggle) onToggle()
        else setInternalOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  // Keyboard navigation inside menu
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev + 1) % MENU_ITEMS.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (onToggle) onToggle()
      else setInternalOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Menú de atajos secundarios (M)"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:bg-white/20 transition text-sm font-medium text-white"
      >
        <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/15 border border-white/25 font-mono text-[10px] font-semibold leading-none">
          M
        </kbd>
        <span>Menú</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Atajos secundarios"
          className="absolute right-0 mt-2 w-72 glass-card p-2 z-50 shadow-xl"
        >
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1">
            Atajos secundarios
          </p>
          <ul className="space-y-0.5">
            {MENU_ITEMS.map((item, index) => (
              <li key={item.key}>
                <div
                  role="menuitem"
                  tabIndex={0}
                  className={`flex items-start gap-3 px-3 py-2 rounded-lg cursor-default transition-colors ${
                    focusedIndex === index
                      ? 'bg-violet-500/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <kbd className="shrink-0 inline-flex items-center justify-center min-w-10 px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[10px] font-semibold text-white leading-none mt-0.5">
                    {item.key}
                  </kbd>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-white/40 leading-snug">{item.description}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="px-3 pt-2 pb-1 text-xs text-white/30 border-t border-white/10 mt-1">
            ↑↓ para navegar · Esc para cerrar
          </p>
        </div>
      )}
    </div>
  )
}
