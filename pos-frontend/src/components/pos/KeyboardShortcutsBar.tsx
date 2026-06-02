/**
 * KeyboardShortcutsBar — Req-7 (7.4), RNF-12
 *
 * Horizontal bar showing the main keyboard shortcuts as compact badges.
 * Displayed permanently in the POS navbar so the cashier always has a
 * visual reference of the available function keys.
 */

interface Shortcut {
  key: string
  label: string
}

const SHORTCUTS: Shortcut[] = [
  { key: 'F1', label: 'Buscar' },
  { key: 'F2', label: 'Eliminar último' },
  { key: 'F3', label: 'Limpiar' },
  { key: 'F4', label: 'IVA/Desc' },
  { key: 'F5', label: 'Pago' },
  { key: 'F6', label: 'Cobrar' },
  { key: 'F7', label: 'Imprimir' },
  { key: 'F8', label: 'Nueva venta' },
  { key: 'F9', label: 'Salir' },
  { key: 'M', label: 'Menú' },
]

export default function KeyboardShortcutsBar() {
  return (
    <nav
      aria-label="Atajos de teclado"
      className="flex items-center gap-1 flex-wrap"
    >
      {SHORTCUTS.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          <kbd className="key">{key}</kbd>
          <span
            className="hidden sm:inline"
            style={{ color: 'var(--text-muted)' }}
          >
            {label}
          </span>
        </span>
      ))}
    </nav>
  )
}
