import apiClient from './client'
import type { Producto, ProductoSearchResult } from '../types/producto.types'

/**
 * GET /productos?q=texto
 * Returns a list of active products matching the search query.
 * Used by ProductSearch to populate the dropdown.
 */
export async function buscarProductos(q: string): Promise<ProductoSearchResult[]> {
  const response = await apiClient.get<ProductoSearchResult[]>('/productos', {
    params: { q },
  })
  return response.data
}

/**
 * GET /productos — Paginated list with optional filters.
 * Used by the admin Productos module.
 */
export async function listarProductos(params?: {
  q?: string
  page?: number
  size?: number
}): Promise<{ content: Producto[]; totalElements: number; totalPages: number }> {
  const response = await apiClient.get('/productos', { params })
  return response.data
}

/**
 * POST /productos — Create a new product (ADMIN only).
 */
export async function crearProducto(data: Omit<Producto, 'id' | 'activo'>): Promise<Producto> {
  const response = await apiClient.post<Producto>('/productos', data)
  return response.data
}

/**
 * PUT /productos/:id — Update an existing product (ADMIN only).
 */
export async function actualizarProducto(id: number, data: Partial<Omit<Producto, 'id'>>): Promise<Producto> {
  const response = await apiClient.put<Producto>(`/productos/${id}`, data)
  return response.data
}

/**
 * DELETE /productos/:id — Soft-delete a product (ADMIN only).
 */
export async function desactivarProducto(id: number): Promise<void> {
  await apiClient.delete(`/productos/${id}`)
}
