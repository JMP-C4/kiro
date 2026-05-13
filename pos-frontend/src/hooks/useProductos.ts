import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../api/productos.api'
import type { ProductosFilters } from '../types/producto.types'

const QUERY_KEY = 'productos'

/**
 * Hook para listar productos con filtros.
 * Usa React Query para cache y loading states automáticos.
 */
export function useProductos(filters: ProductosFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => productosApi.getAll(filters),
    staleTime: 30_000, // 30 segundos de cache
  })
}

/**
 * Hook para crear un producto.
 * Invalida el cache de productos al completar.
 */
export function useCreateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Hook para actualizar un producto.
 */
export function useUpdateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof productosApi.update>[1] }) =>
      productosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Hook para eliminar un producto.
 */
export function useDeleteProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productosApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
