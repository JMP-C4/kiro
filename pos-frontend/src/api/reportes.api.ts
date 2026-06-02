import apiClient from './client'
import type { ReporteVentasResponse } from '../types/reporte.types'

/**
 * GET /reportes/ventas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Solo SUPERVISOR y ADMIN — Req-10
 */
export async function getReporteVentas(
  desde: string,
  hasta: string
): Promise<ReporteVentasResponse> {
  const response = await apiClient.get<ReporteVentasResponse>('/reportes/ventas', {
    params: { desde, hasta },
  })
  return response.data
}
