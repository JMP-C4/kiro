import { calcularCambio, calcularTotales } from '../lib/calcularTotales'
import type { ConfiguracionResponse } from '../types/config.types'
import type { VentaDraft, VentaResponse } from '../types/venta.types'

const CONFIG_KEY = 'ticket-preview-app:config'
const VENTAS_KEY = 'ticket-preview-app:ventas'

const defaultConfig: ConfiguracionResponse = {
  id: 'global',
  nombre_negocio: 'Kiro Market Demo',
  tasa_iva: 0.19,
  formato_papel: '80mm',
  logo_url: null,
  updated_at: '2026-06-08T16:00:00.000Z',
}

const seedVentas: VentaDraft[] = [
  {
    id: 'venta-demo-001',
    numero_venta: 'VTA-20260608-0042',
    cajero_nombre: 'Juan Parada',
    metodo_pago: 'EFECTIVO',
    monto_recibido: 30000,
    descuento_pct: 0.05,
    created_at: '2026-06-08T15:30:00.000Z',
    items: [
      {
        producto_id: 'prod-001',
        nombre_producto: 'Arroz Diana 1kg',
        cantidad: 2,
        precio_unitario: 4500,
        incluye_iva: true,
      },
      {
        producto_id: 'prod-002',
        nombre_producto: 'Leche Entera 1L',
        cantidad: 3,
        precio_unitario: 3500,
        incluye_iva: false,
      },
      {
        producto_id: 'prod-003',
        nombre_producto: 'Banano',
        cantidad: 1.2,
        precio_unitario: 1225,
        incluye_iva: false,
      },
    ],
  },
  {
    id: 'venta-demo-002',
    numero_venta: 'VTA-20260608-0043',
    cajero_nombre: 'Laura Mendoza',
    metodo_pago: 'TARJETA',
    monto_recibido: null,
    descuento_pct: 0,
    created_at: '2026-06-08T16:05:00.000Z',
    items: [
      {
        producto_id: 'prod-010',
        nombre_producto: 'Huevos AA x12',
        cantidad: 1,
        precio_unitario: 9800,
        incluye_iva: true,
      },
      {
        producto_id: 'prod-011',
        nombre_producto: 'Cafe Molido 500g',
        cantidad: 1,
        precio_unitario: 14500,
        incluye_iva: false,
      },
    ],
  },
  {
    id: 'venta-demo-003',
    numero_venta: 'VTA-20260608-0044',
    cajero_nombre: 'Camilo Rojas',
    metodo_pago: 'TRANSFERENCIA',
    monto_recibido: null,
    descuento_pct: 0.08,
    created_at: '2026-06-08T16:20:00.000Z',
    items: [
      {
        producto_id: 'prod-020',
        nombre_producto: 'Detergente Liquido 2L',
        cantidad: 1,
        precio_unitario: 22800,
        incluye_iva: true,
      },
      {
        producto_id: 'prod-021',
        nombre_producto: 'Papel Higienico x4',
        cantidad: 2,
        precio_unitario: 8900,
        incluye_iva: false,
      },
    ],
  },
]

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, data: T) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(data))
}

function hydrateVenta(draft: VentaDraft, config: ConfiguracionResponse): VentaResponse {
  const items = draft.items.map((item, index) => ({
    idx: index + 1,
    producto_id: item.producto_id,
    nombre_producto: item.nombre_producto,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    incluye_iva: item.incluye_iva,
    subtotal: item.precio_unitario * item.cantidad,
  }))

  const totals = calcularTotales(
    items.map((item) => ({
      precio: item.precio_unitario,
      cantidad: item.cantidad,
      incluye_iva: item.incluye_iva,
    })),
    config.tasa_iva,
    draft.descuento_pct,
  )

  return {
    id: draft.id,
    numero_venta: draft.numero_venta,
    cajero_nombre: draft.cajero_nombre,
    subtotal_sin_iva: totals.subtotalSinIVA,
    descuento_pct: draft.descuento_pct,
    descuento_monto: totals.descuentoMonto,
    iva_monto: totals.montoIVA,
    total_con_iva: totals.totalConIVA,
    metodo_pago: draft.metodo_pago,
    monto_recibido: draft.monto_recibido,
    cambio:
      draft.metodo_pago === 'EFECTIVO' && draft.monto_recibido !== null
        ? calcularCambio(draft.monto_recibido, totals.totalConIVA)
        : null,
    created_at: draft.created_at,
    items,
  }
}

export function ensureMockDb() {
  const config = readJson<ConfiguracionResponse>(CONFIG_KEY, defaultConfig)
  const ventas = readJson<VentaDraft[]>(VENTAS_KEY, seedVentas)

  writeJson(CONFIG_KEY, config)
  writeJson(VENTAS_KEY, ventas)
}

export function getConfiguracion(): ConfiguracionResponse {
  ensureMockDb()
  return readJson<ConfiguracionResponse>(CONFIG_KEY, defaultConfig)
}

export function updateConfiguracion(
  next: Partial<ConfiguracionResponse>,
): ConfiguracionResponse {
  const current = getConfiguracion()
  const updated = {
    ...current,
    ...next,
    updated_at: new Date().toISOString(),
  }
  writeJson(CONFIG_KEY, updated)
  return updated
}

export function listVentas(): VentaResponse[] {
  const config = getConfiguracion()
  const ventas = readJson<VentaDraft[]>(VENTAS_KEY, seedVentas)
  return ventas.map((venta) => hydrateVenta(venta, config))
}

export function resetMockDb() {
  writeJson(CONFIG_KEY, defaultConfig)
  writeJson(VENTAS_KEY, seedVentas)
}
