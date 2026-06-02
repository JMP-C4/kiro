// Respuesta del backend Lambda (snake_case)
export interface VentaItemResponse {
  idx: number
  producto_id: string | null
  nombre_producto: string
  cantidad: number
  precio_unitario: number
  incluye_iva: boolean
  subtotal: number
}

export interface VentaResponse {
  id: string
  numero_venta: string
  cajero_nombre: string
  subtotal_sin_iva: number
  descuento_pct: number
  descuento_monto: number
  iva_monto: number
  total_con_iva: number
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'
  monto_recibido: number | null
  cambio: number | null
  created_at: string
  items: VentaItemResponse[]
}

// Request al backend (snake_case — igual que el backend espera)
export interface VentaRequest {
  items: {
    producto_id: string | null
    nombre_producto: string
    cantidad: number
    precio_unitario: number
    incluye_iva: boolean
    subtotal: number
  }[]
  descuento_pct: number
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'
  monto_recibido: number | null
}
