/**
 * Tests de useKeyboardShortcuts
 *
 * Verifica:
 *   RNF-13: atajos ejecutan en < 50ms
 *   P-11: F1-F9 se desactivan cuando modalOpen=true, excepto Esc
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

// ── Helper ────────────────────────────────────────────────────────────────────

function fireKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

afterEach(() => {
  cleanup()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useKeyboardShortcuts', () => {
  it('ejecuta la acción al presionar la tecla registrada', () => {
    const action = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: 'F1', action, description: 'Buscar' }], false)
    )
    act(() => { fireKey('F1') })
    expect(action).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('P-11: bloquea F1-F9 cuando modalOpen=true', () => {
    const actions = Object.fromEntries(
      ['F1','F2','F3','F4','F5','F6','F7','F8','F9'].map((k) => [k, vi.fn()])
    )
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts(
        Object.entries(actions).map(([key, action]) => ({ key, action, description: key })),
        true
      )
    )
    act(() => {
      for (const key of ['F1','F2','F3','F4','F5','F6','F7','F8','F9']) fireKey(key)
    })
    for (const action of Object.values(actions)) {
      expect(action).not.toHaveBeenCalled()
    }
    unmount()
  })

  it('P-11: Escape sí funciona cuando modalOpen=true', () => {
    const onEsc = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: 'Escape', action: onEsc, description: 'Cerrar' }], true)
    )
    act(() => { fireKey('Escape') })
    expect(onEsc).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('P-11: atajos vuelven a funcionar cuando modalOpen cambia a false', () => {
    const action = vi.fn()
    const { rerender, unmount } = renderHook(
      ({ modalOpen }) =>
        useKeyboardShortcuts([{ key: 'F1', action, description: 'Buscar' }], modalOpen),
      { initialProps: { modalOpen: true } }
    )
    act(() => { fireKey('F1') })
    expect(action).not.toHaveBeenCalled()

    rerender({ modalOpen: false })
    act(() => { fireKey('F1') })
    expect(action).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('respeta el flag disabled individual', () => {
    const action = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: 'F2', action, description: 'Eliminar', disabled: true }], false)
    )
    act(() => { fireKey('F2') })
    expect(action).not.toHaveBeenCalled()
    unmount()
  })

  it('RNF-13: la acción se ejecuta en < 50ms', () => {
    const action = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: 'F1', action, description: 'Buscar' }], false)
    )
    const start = performance.now()
    act(() => { fireKey('F1') })
    const elapsed = performance.now() - start
    expect(action).toHaveBeenCalled()
    expect(elapsed).toBeLessThan(50)
    unmount()
  })

  it('no ejecuta acciones para teclas no registradas', () => {
    const action = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: 'F1', action, description: 'Buscar' }], false)
    )
    act(() => { fireKey('F2') })
    act(() => { fireKey('a') })
    expect(action).not.toHaveBeenCalled()
    unmount()
  })

  it('es case-insensitive para teclas de letra', () => {
    const action = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: 'm', action, description: 'Menú' }], false)
    )
    act(() => { fireKey('M') })
    expect(action).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('limpia el listener al desmontar', () => {
    const action = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: 'F1', action, description: 'Buscar' }], false)
    )
    unmount()
    act(() => { fireKey('F1') })
    expect(action).not.toHaveBeenCalled()
  })
})
