import apiClient from './client'
import type { ConfiguracionResponse, ConfiguracionRequest } from '../types/reporte.types'

/**
 * GET /configuracion — todos los roles autenticados — Req-11 (11.1)
 */
export async function getConfiguracion(): Promise<ConfiguracionResponse> {
  const response = await apiClient.get<ConfiguracionResponse>('/configuracion')
  return response.data
}

/**
 * PUT /configuracion — solo ADMIN — Req-11 (11.2)
 */
export async function updateConfiguracion(
  data: ConfiguracionRequest
): Promise<ConfiguracionResponse> {
  const response = await apiClient.put<ConfiguracionResponse>('/configuracion', data)
  return response.data
}
