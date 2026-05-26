import apiClient from './client'
import type { VentaRequest, VentaResponse } from '../types/venta.types'

/**
 * POST /ventas — Registrar una venta completa.
 * Req-6 (6.2, 6.3), P-08
 */
export async function crearVenta(request: VentaRequest): Promise<VentaResponse> {
  const response = await apiClient.post<VentaResponse>('/ventas', request)
  return response.data
}
