/**
 * calcularTotales.ts — Lógica pura de IVA. Sin dependencias React.
 * P-01, P-02, P-03, P-04
 */

// Tipo mínimo requerido para el cálculo (subconjunto de CartItem)
export interface ItemParaCalculo {
  precio: number
  cantidad: number
  incluye_iva: boolean
}

export interface Totales {
  subtotalSinIVA: number
  montoIVA: number
  totalConIVA: number
  descuentoMonto: number
}

export function calcularTotales(
  items: ItemParaCalculo[],
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
