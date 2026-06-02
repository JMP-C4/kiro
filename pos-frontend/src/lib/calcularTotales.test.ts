/**
 * Tests unitarios — calcularTotales
 * P-01, P-02, P-03, P-04
 */

import { describe, it, expect } from 'vitest'
import { calcularTotales, calcularCambio } from './calcularTotales'
import type { ItemParaCalculo } from './calcularTotales'

const TASA = 0.19
const r = (n: number) => Math.round(n * 1_000_000) / 1_000_000

// Helper: crea un item mínimo para los tests
function item(precio: number, cantidad: number, incluye_iva: boolean): ItemParaCalculo {
  return { precio, cantidad, incluye_iva }
}

// ---------------------------------------------------------------------------
// P-01: IVA incluido
// ---------------------------------------------------------------------------
describe('P-01 — IVA incluido', () => {
  it('extrae correctamente la base cuando incluye_iva=true', () => {
    const { subtotalSinIVA, montoIVA, totalConIVA } = calcularTotales(
      [item(4500, 1, true)], TASA, 0
    )
    const expectedBase = 4500 / (1 + TASA)
    expect(r(subtotalSinIVA)).toBe(r(expectedBase))
    expect(r(montoIVA)).toBe(r(expectedBase * TASA))
    expect(r(totalConIVA)).toBeCloseTo(4500, 4)
  })

  it('maneja múltiples ítems con IVA incluido', () => {
    const { totalConIVA } = calcularTotales(
      [item(1190, 2, true), item(2380, 1, true)], TASA, 0
    )
    expect(r(totalConIVA)).toBeCloseTo(4760, 4)
  })
})

// ---------------------------------------------------------------------------
// P-02: IVA excluido
// ---------------------------------------------------------------------------
describe('P-02 — IVA excluido', () => {
  it('agrega IVA correctamente cuando incluye_iva=false', () => {
    const { subtotalSinIVA, montoIVA, totalConIVA } = calcularTotales(
      [item(3200, 1, false)], TASA, 0
    )
    expect(r(subtotalSinIVA)).toBe(3200)
    expect(r(montoIVA)).toBeCloseTo(3200 * TASA, 4)
    expect(r(totalConIVA)).toBeCloseTo(3200 * (1 + TASA), 4)
  })

  it('multiplica correctamente por cantidad', () => {
    const { subtotalSinIVA, montoIVA } = calcularTotales(
      [item(1000, 3, false)], TASA, 0
    )
    expect(r(subtotalSinIVA)).toBe(3000)
    expect(r(montoIVA)).toBeCloseTo(3000 * TASA, 4)
  })
})

// ---------------------------------------------------------------------------
// P-03: Descuento global
// ---------------------------------------------------------------------------
describe('P-03 — Descuento global', () => {
  it('aplica descuento del 10% correctamente', () => {
    const { subtotalSinIVA, descuentoMonto, montoIVA, totalConIVA } = calcularTotales(
      [item(10000, 1, false)], TASA, 0.10
    )
    expect(r(subtotalSinIVA)).toBe(10000)
    expect(r(descuentoMonto)).toBe(1000)
    expect(r(montoIVA)).toBeCloseTo(9000 * TASA, 4)
    expect(r(totalConIVA)).toBeCloseTo(9000 * (1 + TASA), 4)
  })

  it('descuento 0% no modifica el total', () => {
    const { descuentoMonto, totalConIVA } = calcularTotales(
      [item(5000, 1, false)], TASA, 0
    )
    expect(r(descuentoMonto)).toBe(0)
    expect(r(totalConIVA)).toBeCloseTo(5000 * (1 + TASA), 4)
  })

  it('descuento 100% resulta en total cero', () => {
    const { totalConIVA } = calcularTotales([item(5000, 1, false)], TASA, 1)
    expect(r(totalConIVA)).toBeCloseTo(0, 4)
  })
})

// ---------------------------------------------------------------------------
// Carrito vacío
// ---------------------------------------------------------------------------
describe('Carrito vacío', () => {
  it('retorna todos los totales en cero', () => {
    const { subtotalSinIVA, montoIVA, totalConIVA, descuentoMonto } = calcularTotales([], TASA, 0)
    expect(subtotalSinIVA).toBe(0)
    expect(montoIVA).toBe(0)
    expect(totalConIVA).toBe(0)
    expect(descuentoMonto).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Mezcla de ítems con y sin IVA
// ---------------------------------------------------------------------------
describe('Mezcla incluye_iva=true e incluye_iva=false', () => {
  it('calcula correctamente con ítems mixtos', () => {
    const { subtotalSinIVA, totalConIVA } = calcularTotales(
      [item(1190, 1, true), item(1000, 1, false)], TASA, 0
    )
    const baseConIVA = 1190 / (1 + TASA)
    const baseSinIVA = 1000
    const expectedSubtotal = baseConIVA + baseSinIVA
    expect(r(subtotalSinIVA)).toBeCloseTo(expectedSubtotal, 4)
    expect(r(totalConIVA)).toBeCloseTo(expectedSubtotal * (1 + TASA), 4)
  })
})

// ---------------------------------------------------------------------------
// P-04: calcularCambio
// ---------------------------------------------------------------------------
describe('P-04 — calcularCambio', () => {
  it('calcula el cambio correctamente', () => {
    expect(calcularCambio(50000, 42350)).toBeCloseTo(7650, 2)
  })

  it('retorna 0 cuando el monto exacto es igual al total', () => {
    expect(calcularCambio(42350, 42350)).toBe(0)
  })

  it('nunca retorna cambio negativo', () => {
    expect(calcularCambio(10000, 42350)).toBe(0)
  })
})
