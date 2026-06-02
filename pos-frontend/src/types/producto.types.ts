export interface Producto {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  categoria?: string
  precio: number
  incluye_iva: boolean
  unidad_medida: string // 'und' | 'kg' | 'g' | 'lb'
  activo: boolean
}

export interface ProductoSearchResult {
  id: string
  codigo: string
  nombre: string
  precio: number
  incluye_iva: boolean
  unidad_medida: string
}
