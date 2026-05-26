/**
 * calcularTotales.ts
 *
 * Lógica pura de cálculo de IVA y totales del carrito.
 * Función PURA — sin efectos secundarios, sin dependencias React.
 * Principio SRP: solo calcula, no renderiza.
 *
 * Algoritmo:
 *   - Si incluye_iva=true:  precioBase = precio / (1 + tasaIVA)  → desglosar IVA incluido
 *   - Si incluye_iva=false: precioBase = precio                  → agregar IVA encima
 *   - descuentoMonto = subtotalSinIVA * descuentoPct
 *   - baseConDescuento = subtotalSinIVA - descuentoMonto
 *   - montoIVA = baseConDescuento * tasaIVA
 *   - totalConIVA = baseConDescuento + montoIVA
 *
 * Propiedades de corrección:
 *   P-01: Para cualquier ítem con incluye_iva=true,  precioBase = precio / (1 + tasaIVA)
 *   P-02: Para cualquier ítem con incluye_iva=false, montoIVA = precio * tasaIVA * cantidad
 *   P-03: total = (subtotal - descuento) * (1 + tasaIVA)
 *   P-04: cambio = max(0, montoRecibido - total)
 */

import type { CartItem, Totales } from '../types/pos.types'

/**
 * Calcula los totales del carrito aplicando IVA y descuento global.
 *
 * @param items       - Lista de ítems del carrito
 * @param tasaIVA     - Tasa de IVA como decimal, ej: 0.19 para 19%
 * @param descuentoPct - Porcentaje de descuento global como decimal, ej: 0.10 para 10%
 * @returns Totales   - { subtotalSinIVA, montoIVA, totalConIVA, descuentoMonto }
 */
export function calcularTotales(
  items: CartItem[],
  tasaIVA: number,
  descuentoPct: number
): Totales {
  // Paso 1: Calcular subtotal sin IVA
  // Si incluye_iva=true: el precio ya contiene IVA → extraer base dividiendo por (1 + tasaIVA)
  // Si incluye_iva=false: el precio ya es la base sin IVA
  const subtotalSinIVA = items.reduce((acc, item) => {
    const base = item.incluye_iva
      ? item.precio / (1 + tasaIVA)
      : item.precio
    return acc + base * item.cantidad
  }, 0)

  // Paso 2: Aplicar descuento sobre el subtotal sin IVA
  const descuentoMonto = subtotalSinIVA * descuentoPct

  // Paso 3: Base imponible después del descuento
  const baseConDescuento = subtotalSinIVA - descuentoMonto

  // Paso 4: Calcular IVA sobre la base con descuento
  const montoIVA = baseConDescuento * tasaIVA

  // Paso 5: Total final = base con descuento + IVA
  const totalConIVA = baseConDescuento + montoIVA

  return { subtotalSinIVA, montoIVA, totalConIVA, descuentoMonto }
}

/**
 * Calcula el cambio a devolver al cliente.
 * P-04: cambio = max(0, montoRecibido - total)
 *
 * @param montoRecibido - Monto entregado por el cliente
 * @param total         - Total de la venta a cobrar
 * @returns El cambio a devolver; nunca negativo
 */
export function calcularCambio(montoRecibido: number, total: number): number {
  return Math.max(0, montoRecibido - total)
}
