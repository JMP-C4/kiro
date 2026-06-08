export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'

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
  metodo_pago: MetodoPago
  monto_recibido: number | null
  cambio: number | null
  created_at: string
  items: VentaItemResponse[]
}

export interface VentaDraft {
  id: string
  numero_venta: string
  cajero_nombre: string
  metodo_pago: MetodoPago
  monto_recibido: number | null
  descuento_pct: number
  created_at: string
  items: Array<{
    producto_id: string | null
    nombre_producto: string
    cantidad: number
    precio_unitario: number
    incluye_iva: boolean
  }>
}
