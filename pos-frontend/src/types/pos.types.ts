export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'
export type ModalType = 'iva' | 'pago' | 'ticket' | 'peso' | 'confirmar-limpiar' | null

export interface CartItem {
  lineId: string          // nanoid() — unique per line
  productoId: number
  nombre: string
  codigo: string
  precio: number          // price as stored (may or may not include IVA)
  incluye_iva: boolean
  unidad_medida: string   // 'und' | 'kg' | 'g' | 'lb'
  cantidad: number        // for weight products: weight in kg/g/lb
  subtotal: number        // calculated: precio * cantidad (base price)
}

export interface Totales {
  subtotalSinIVA: number
  montoIVA: number
  totalConIVA: number
  descuentoMonto: number
}

export interface PosState {
  items: CartItem[]
  selectedIndex: number | null
  descuentoPct: number
  metodoPago: MetodoPago | null
  montoPagado: number
  activeModal: ModalType
  totales: Totales
}
