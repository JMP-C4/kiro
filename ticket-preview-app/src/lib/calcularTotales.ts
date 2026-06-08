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
  descuentoPct: number,
): Totales {
  const subtotalSinIVA = items.reduce((acc, item) => {
    const base = item.incluye_iva ? item.precio / (1 + tasaIVA) : item.precio
    return acc + base * item.cantidad
  }, 0)

  const descuentoMonto = subtotalSinIVA * descuentoPct
  const baseConDescuento = subtotalSinIVA - descuentoMonto
  const montoIVA = baseConDescuento * tasaIVA
  const totalConIVA = baseConDescuento + montoIVA

  return { subtotalSinIVA, montoIVA, totalConIVA, descuentoMonto }
}

export function calcularCambio(montoRecibido: number, total: number): number {
  return Math.max(0, montoRecibido - total)
}
