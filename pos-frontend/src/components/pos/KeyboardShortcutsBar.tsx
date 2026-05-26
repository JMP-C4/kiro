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
          className="inline-flex items-center gap-1 text-xs text-white/70"
        >
          <kbd className="inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded bg-white/15 border border-white/25 font-mono text-[10px] font-semibold text-white leading-none">
            {key}
          </kbd>
          <span className="hidden sm:inline text-white/50">{label}</span>
        </span>
      ))}
    </nav>
  )
}
