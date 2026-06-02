import axios from 'axios'

const TOKEN_KEY = 'token'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Authorization header from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---------------------------------------------------------------------------
// MOCK INTERCEPTOR — devuelve datos falsos cuando el backend no está corriendo.
// Eliminar este bloque cuando el backend esté disponible en localhost:8080.
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const url: string = error.config?.url ?? ''

    // Si el error es de red (backend no disponible), devolver mock data
    if (!error.response) {
      // GET /productos → lista vacía
      if (url.includes('/productos')) {
        return { data: { content: [], totalElements: 0, totalPages: 0 } }
      }
      // GET /usuarios → lista vacía
      if (url.includes('/usuarios')) {
        return { data: [] }
      }
      // GET /reportes → reporte vacío
      if (url.includes('/reportes')) {
        return { data: { total_ventas: 0, monto_total: 0, desglose_por_metodo: {}, ventas: [] } }
      }
      // GET /configuracion → config por defecto (formato Lambda snake_case)
      if (url.includes('/configuracion')) {
        return {
          data: {
            id: 'global',
            nombre_negocio: 'Mi Supermercado',
            tasa_iva: 0.19,
            formato_papel: '80mm',
            logo_url: null,
            updated_at: new Date().toISOString(),
          },
        }
      }
      // POST /ventas → venta mock
      if (url.includes('/ventas')) {
        const body = JSON.parse(error.config?.data ?? '{}')
        return {
          data: {
            id: 1,
            numeroVenta: `VTA-MOCK-${Date.now()}`,
            cajeroNombre: 'Demo',
            subtotalSinIva: 0,
            descuentoPct: body.descuentoPct ?? 0,
            descuentoMonto: 0,
            ivaMonto: 0,
            totalConIva: 0,
            metodoPago: body.metodoPago ?? 'EFECTIVO',
            montoRecibido: body.montoRecibido ?? null,
            cambio: null,
            createdAt: new Date().toISOString(),
            items: (body.items ?? []).map((item: Record<string, unknown>, i: number) => ({
              id: i + 1,
              productoId: item.productoId ?? null,
              nombreProducto: item.nombreProducto ?? '',
              cantidad: item.cantidad ?? 1,
              precioUnitario: item.precioUnitario ?? 0,
              incluyeIva: item.incluyeIva ?? false,
              subtotal: item.subtotal ?? 0,
            })),
          },
        }
      }
    }

    // Errores reales de autenticación → redirigir al login
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)
// ---------------------------------------------------------------------------
// FIN MOCK INTERCEPTOR
// ---------------------------------------------------------------------------

export default apiClient
