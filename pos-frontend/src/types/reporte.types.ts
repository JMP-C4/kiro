import type { VentaResponse } from './venta.types'

export interface ReporteVentasResponse {
  total_ventas: number
  monto_total: number
  desglose_por_metodo: Record<string, number>
  ventas: VentaResponse[]
}

export interface ConfiguracionResponse {
  id: string
  nombre_negocio: string
  tasa_iva: number
  formato_papel: '80mm' | '58mm' | 'carta'
  logo_url: string | null
  updated_at: string
}

export interface ConfiguracionRequest {
  nombre_negocio?: string
  tasa_iva?: number
  formato_papel?: '80mm' | '58mm' | 'carta'
  logo_url?: string | null
}
