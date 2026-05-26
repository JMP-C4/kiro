export interface VentaItemResponse {
  id: number
  productoId: number | null
  nombreProducto: string
  cantidad: number
  precioUnitario: number
  incluyeIva: boolean
  subtotal: number
}

export interface VentaResponse {
  id: number
  numeroVenta: string
  cajeroNombre: string
  subtotalSinIva: number
  descuentoPct: number
  descuentoMonto: number
  ivaMonto: number
  totalConIva: number
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'
  montoRecibido: number | null
  cambio: number | null
  createdAt: string  // ISO date string
  items: VentaItemResponse[]
}

export interface VentaRequest {
  items: {
    productoId: number | null
    nombreProducto: string
    cantidad: number
    precioUnitario: number
    incluyeIva: boolean
    subtotal: number
  }[]
  descuentoPct: number
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'
  montoRecibido: number | null
}
