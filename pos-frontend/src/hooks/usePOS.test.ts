/**
 * Tests unitarios — reducer del carrito (usePOS)
 *
 * Verifica la propiedad de corrección P-05:
 *   ADD_ITEM siempre crea una línea nueva — nunca acumula en línea existente.
 *
 * También verifica: REMOVE_LAST, CLEAR_CART, SET_DESCUENTO,
 * MOVE_SELECTION, REMOVE_ITEM, SET_MODAL.
 *
 * Requisitos: Req-3, P-05
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePOS } from './usePOS'
import type { CartItem } from '../types/pos.types'

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------
function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    lineId: `line-${Math.random().toString(36).slice(2, 7)}`,
    productoId: 'prod-001',
    nombre: 'Arroz Diana 1kg',
    codigo: '7701234567890',
    precio: 4500,
    incluye_iva: true,
    unidad_medida: 'und',
    cantidad: 1,
    subtotal: 4500,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// P-05: ADD_ITEM siempre crea línea nueva
// ---------------------------------------------------------------------------
describe('P-05 — ADD_ITEM siempre crea línea nueva', () => {
  it('agrega el mismo producto dos veces como dos líneas distintas', () => {
    const { result } = renderHook(() => usePOS())

    const item1 = makeItem({ lineId: 'line-a', productoId: 'prod-001' })
    const item2 = makeItem({ lineId: 'line-b', productoId: 'prod-001' }) // mismo producto, lineId distinto

    act(() => { result.current.addItem(item1) })
    act(() => { result.current.addItem(item2) })

    expect(result.current.state.items).toHaveLength(2)
    expect(result.current.state.items[0].lineId).toBe('line-a')
    expect(result.current.state.items[1].lineId).toBe('line-b')
  })

  it('nunca modifica una línea existente al agregar el mismo producto', () => {
    const { result } = renderHook(() => usePOS())

    const item = makeItem({ lineId: 'line-a', cantidad: 1 })
    act(() => { result.current.addItem(item) })

    const itemDuplicado = makeItem({ lineId: 'line-b', cantidad: 1 })
    act(() => { result.current.addItem(itemDuplicado) })

    // La primera línea no debe haber cambiado su cantidad
    expect(result.current.state.items[0].cantidad).toBe(1)
    expect(result.current.state.items).toHaveLength(2)
  })

  it('recalcula los totales al agregar un ítem', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ precio: 4500, incluye_iva: true, cantidad: 1 })) })

    expect(result.current.state.totales.totalConIVA).toBeCloseTo(4500, 2)
    expect(result.current.state.totales.subtotalSinIVA).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// REMOVE_LAST
// ---------------------------------------------------------------------------
describe('REMOVE_LAST', () => {
  it('elimina el último ítem agregado', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ lineId: 'a', nombre: 'Primero' })) })
    act(() => { result.current.addItem(makeItem({ lineId: 'b', nombre: 'Segundo' })) })
    act(() => { result.current.removeLast() })

    expect(result.current.state.items).toHaveLength(1)
    expect(result.current.state.items[0].lineId).toBe('a')
  })

  it('no hace nada si el carrito está vacío', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.removeLast() })

    expect(result.current.state.items).toHaveLength(0)
  })

  it('recalcula totales tras eliminar el último ítem', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ precio: 1000, incluye_iva: false, cantidad: 1 })) })
    act(() => { result.current.removeLast() })

    expect(result.current.state.totales.totalConIVA).toBe(0)
    expect(result.current.state.totales.subtotalSinIVA).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// CLEAR_CART
// ---------------------------------------------------------------------------
describe('CLEAR_CART', () => {
  it('vacía el carrito completamente', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ lineId: 'a' })) })
    act(() => { result.current.addItem(makeItem({ lineId: 'b' })) })
    act(() => { result.current.clearCart() })

    expect(result.current.state.items).toHaveLength(0)
  })

  it('reinicia los totales a cero', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ precio: 5000, incluye_iva: false, cantidad: 2 })) })
    act(() => { result.current.clearCart() })

    const { subtotalSinIVA, montoIVA, totalConIVA, descuentoMonto } = result.current.state.totales
    expect(subtotalSinIVA).toBe(0)
    expect(montoIVA).toBe(0)
    expect(totalConIVA).toBe(0)
    expect(descuentoMonto).toBe(0)
  })

  it('reinicia selectedIndex a null', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ lineId: 'a' })) })
    act(() => { result.current.selectItem(0) })
    act(() => { result.current.clearCart() })

    expect(result.current.state.selectedIndex).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// REMOVE_ITEM
// ---------------------------------------------------------------------------
describe('REMOVE_ITEM', () => {
  it('elimina el ítem con el lineId indicado', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ lineId: 'a' })) })
    act(() => { result.current.addItem(makeItem({ lineId: 'b' })) })
    act(() => { result.current.addItem(makeItem({ lineId: 'c' })) })
    act(() => { result.current.removeItem('b') })

    expect(result.current.state.items).toHaveLength(2)
    expect(result.current.state.items.map((i) => i.lineId)).toEqual(['a', 'c'])
  })

  it('recalcula totales tras eliminar un ítem', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ lineId: 'a', precio: 1000, incluye_iva: false, cantidad: 1 })) })
    act(() => { result.current.addItem(makeItem({ lineId: 'b', precio: 2000, incluye_iva: false, cantidad: 1 })) })
    act(() => { result.current.removeItem('b') })

    expect(result.current.state.totales.subtotalSinIVA).toBeCloseTo(1000, 2)
  })
})

// ---------------------------------------------------------------------------
// SET_DESCUENTO
// ---------------------------------------------------------------------------
describe('SET_DESCUENTO', () => {
  it('aplica el descuento y recalcula totales', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ precio: 10000, incluye_iva: false, cantidad: 1 })) })
    act(() => { result.current.setDescuento(0.10) })

    expect(result.current.state.descuentoPct).toBe(0.10)
    expect(result.current.state.totales.descuentoMonto).toBeCloseTo(1000, 2)
    expect(result.current.state.totales.totalConIVA).toBeCloseTo(9000 * 1.19, 2)
  })
})

// ---------------------------------------------------------------------------
// MOVE_SELECTION
// ---------------------------------------------------------------------------
describe('MOVE_SELECTION', () => {
  it('mueve la selección hacia abajo', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ lineId: 'a' })) })
    act(() => { result.current.addItem(makeItem({ lineId: 'b' })) })
    act(() => { result.current.selectItem(0) })
    act(() => { result.current.moveSelection(1) })

    expect(result.current.state.selectedIndex).toBe(1)
  })

  it('no supera el último índice', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ lineId: 'a' })) })
    act(() => { result.current.selectItem(0) })
    act(() => { result.current.moveSelection(1) }) // ya está en el último

    expect(result.current.state.selectedIndex).toBe(0)
  })

  it('no baja de 0', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.addItem(makeItem({ lineId: 'a' })) })
    act(() => { result.current.selectItem(0) })
    act(() => { result.current.moveSelection(-1) })

    expect(result.current.state.selectedIndex).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// SET_MODAL
// ---------------------------------------------------------------------------
describe('SET_MODAL', () => {
  it('abre y cierra modales correctamente', () => {
    const { result } = renderHook(() => usePOS())

    act(() => { result.current.setModal('pago') })
    expect(result.current.state.activeModal).toBe('pago')

    act(() => { result.current.setModal(null) })
    expect(result.current.state.activeModal).toBeNull()
  })
})
