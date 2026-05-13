export interface Producto {
  id: string
  nombre: string
  categoria: string
  precio: number
  stock: number
  activo: boolean
  fechaCreacion: string
}

export interface ProductosFilters {
  categoria?: string
  nombre?: string
  page?: number
  limit?: number
}

export interface ProductosPaginados {
  items: Producto[]
  total: number
  page: number
  limit: number
  totalPages: number
}
