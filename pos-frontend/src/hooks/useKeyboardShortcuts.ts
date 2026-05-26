import { useEffect, useRef } from 'react'

/**
 * Configuration for a single keyboard shortcut.
 *
 * `key` should match `KeyboardEvent.key` values:
 *   e.g. 'F1', 'F2', 'Escape', 'Delete', 'ArrowUp', 'ArrowDown', 'm'
 */
export interface ShortcutConfig {
  key: string
  action: () => void
  disabled?: boolean   // individual shortcut can be disabled independently
  description: string  // for display in KeyboardShortcutsBar
}

/** F-keys that should have browser defaults suppressed */
const FKEYS = new Set(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'])

/**
 * Centralised keyboard shortcut hook — Req-7, RNF-11, RNF-13, P-11
 *
 * Registers ONE global `keydown` listener on `window`.
 * When `modalOpen` is true every shortcut is suppressed EXCEPT Escape.
 * Individual shortcuts can also be disabled via `ShortcutConfig.disabled`.
 *
 * Performance: handler runs in < 50 ms (RNF-13) — Map lookup is O(1).
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  modalOpen: boolean
): void {
  // Store the latest shortcuts and modalOpen in refs so the event listener
  // never captures stale closures without needing to be re-registered.
  const shortcutsRef = useRef<ShortcutConfig[]>(shortcuts)
  const modalOpenRef = useRef<boolean>(modalOpen)

  // Keep refs in sync on every render
  shortcutsRef.current = shortcuts
  modalOpenRef.current = modalOpen

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key

      // Suppress browser defaults for F1-F9 regardless of modal state
      if (FKEYS.has(key)) {
        e.preventDefault()
      }

      const currentShortcuts = shortcutsRef.current
      const isModalOpen = modalOpenRef.current

      // Find the matching shortcut (case-insensitive for letter keys)
      const match = currentShortcuts.find(
        (s) => s.key.toLowerCase() === key.toLowerCase()
      )

      if (!match) return

      // When a modal is open, only Escape is allowed
      if (isModalOpen && key !== 'Escape') return

      // Respect individual disabled flag
      if (match.disabled) return

      match.action()
    }

    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, []) // Empty deps — handler always reads from refs, no re-registration needed
}
