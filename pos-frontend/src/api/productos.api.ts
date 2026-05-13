import apiClient from './client'
import type { Producto, ProductosFilters } from '../types/producto.types'

export const productosApi = {
  /**
   * Lista productos activos con filtros opcionales.
   * GET /productos?categoria=X&page=1&limit=10
   */
  getAll: async (filters: ProductosFilters = {}): Promise<Producto[]> => {
    const params: Record<string, string | number> = {}
    if (filters.categoria) params.categoria = filters.categoria
    if (filters.page)      params.page      = filters.page
    if (filters.limit)     params.limit      = filters.limit

    const response = await apiClient.get<Producto[]>('/productos', { params })
    return response.data
  },

  /**
   * Obtiene un producto por ID.
   * GET /productos/:id
   */
  getById: async (id: string): Promise<Producto> => {
    const response = await apiClient.get<Producto>(`/productos/${id}`)
    return response.data
  },

  /**
   * Crea un nuevo producto.
   * POST /productos
   */
  create: async (data: Omit<Producto, 'id' | 'activo' | 'fechaCreacion'>): Promise<Producto> => {
    const response = await apiClient.post<Producto>('/productos', data)
    return response.data
  },

  /**
   * Actualiza un producto existente.
   * PUT /productos/:id
   */
  update: async (id: string, data: Partial<Omit<Producto, 'id' | 'activo' | 'fechaCreacion'>>): Promise<Producto> => {
    const response = await apiClient.put<Producto>(`/productos/${id}`, data)
    return response.data
  },

  /**
   * Elimina lógicamente un producto.
   * DELETE /productos/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/productos/${id}`)
  },
}
