export interface ConfiguracionResponse {
  id: string
  nombre_negocio: string
  tasa_iva: number
  formato_papel: '80mm' | '58mm' | 'carta'
  logo_url: string | null
  updated_at: string
}
