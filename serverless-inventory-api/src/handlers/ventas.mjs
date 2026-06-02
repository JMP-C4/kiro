import { randomUUID } from 'node:crypto'
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { docClient, TABLE } from '../lib/dynamo.mjs'
import { requireRoles, parseAuth } from '../lib/auth.mjs'
import { errorResponse, handleOptions, jsonResponse } from '../lib/http.mjs'

function parseBody(event) {
  if (!event.body) return {}
  if (typeof event.body === 'object') return event.body
  try { return JSON.parse(event.body) } catch { return null }
}

function getPath(event) {
  return event.rawPath ?? event.path ?? event.requestContext?.http?.path ?? ''
}

const TASA_IVA = 0.19

/**
 * Calcula totales en backend — validación independiente del frontend (P-08).
 * Misma lógica que calcularTotales.ts del frontend.
 */
function calcularTotales(items, descuentoPct = 0) {
  const subtotalSinIva = items.reduce((acc, item) => {
    const base = item.incluye_iva
      ? item.precio_unitario / (1 + TASA_IVA)
      : item.precio_unitario
    return acc + base * Number(item.cantidad)
  }, 0)

  const descuentoMonto = subtotalSinIva * descuentoPct
  const baseConDescuento = subtotalSinIva - descuentoMonto
  const ivaMonto = baseConDescuento * TASA_IVA
  const totalConIva = baseConDescuento + ivaMonto

  return {
    subtotal_sin_iva: round2(subtotalSinIva),
    descuento_monto: round2(descuentoMonto),
    iva_monto: round2(ivaMonto),
    total_con_iva: round2(totalConIva),
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

/**
 * Genera número de venta único: VTA-YYYYMMDD-NNNN
 * Consulta el GSI fecha-index para contar ventas del día — P-08.
 */
async function generarNumeroVenta() {
  const hoy = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const prefix = `VTA-${hoy.replace(/-/g, '')}-`

  let count = 0
  try {
    const out = await docClient.send(new QueryCommand({
      TableName: TABLE.ventas,
      IndexName: 'fecha-index',
      KeyConditionExpression: 'fecha = :f',
      ExpressionAttributeValues: { ':f': hoy },
      Select: 'COUNT',
    }))
    count = out.Count ?? 0
  } catch {
    // Si el índice no está disponible (local sin GSI), fallback a timestamp
    count = Date.now() % 10000
  }

  return prefix + String(count + 1).padStart(4, '0')
}

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return handleOptions()
  }

  const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'GET'
  const path = getPath(event)

  try {
    // POST /ventas — registrar venta — Req-6 (6.2, 6.3)
    if (method === 'POST' && path === '/ventas') {
      const user = requireRoles(event, ['CAJERO', 'SUPERVISOR', 'ADMIN'])
      const body = parseBody(event)
      if (body === null) return errorResponse(400, 'JSON inválido')

      const items = body.items
      if (!Array.isArray(items) || items.length === 0) {
        return errorResponse(400, 'La venta debe tener al menos un ítem')
      }

      const metodoPago = String(body.metodo_pago ?? '').toUpperCase()
      if (!['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(metodoPago)) {
        return errorResponse(400, 'Método de pago inválido. Valores: EFECTIVO, TARJETA, TRANSFERENCIA')
      }

      // Validar ítems
      for (const item of items) {
        if (!item.nombre_producto || !item.cantidad || !item.precio_unitario) {
          return errorResponse(400, 'Cada ítem requiere: nombre_producto, cantidad, precio_unitario')
        }
        if (Number(item.cantidad) <= 0 || Number(item.precio_unitario) <= 0) {
          return errorResponse(400, 'Cantidad y precio deben ser positivos')
        }
      }

      const descuentoPct = Number(body.descuento_pct ?? 0)
      if (descuentoPct < 0 || descuentoPct > 1) {
        return errorResponse(400, 'descuento_pct debe estar entre 0 y 1 (ej: 0.10 para 10%)')
      }

      const totales = calcularTotales(items, descuentoPct)

      // Calcular cambio para efectivo
      let cambio = null
      if (metodoPago === 'EFECTIVO') {
        const montoRecibido = Number(body.monto_recibido ?? 0)
        if (montoRecibido < totales.total_con_iva) {
          return errorResponse(400, 'Monto recibido insuficiente')
        }
        cambio = round2(montoRecibido - totales.total_con_iva)
      }

      const now = new Date().toISOString()
      const hoy = now.slice(0, 10)
      const numeroVenta = await generarNumeroVenta()
      const id = `vta-${randomUUID().slice(0, 8)}`

      // Ítems embebidos en el documento JSON (no relacional) — Req-1.3
      const ventaItems = items.map((item, idx) => ({
        idx,
        producto_id: item.producto_id ?? null,
        nombre_producto: String(item.nombre_producto),
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario),
        incluye_iva: !!item.incluye_iva,
        subtotal: round2(Number(item.subtotal ?? item.precio_unitario * item.cantidad)),
      }))

      const venta = {
        id,
        numero_venta: numeroVenta,
        cajero_username: user.sub,
        cajero_nombre: user.nombre,
        fecha: hoy,                  // para GSI fecha-index
        created_at: now,
        items: ventaItems,           // embebidos — DynamoDB no relacional
        descuento_pct: descuentoPct,
        ...totales,
        metodo_pago: metodoPago,
        monto_recibido: body.monto_recibido != null ? Number(body.monto_recibido) : null,
        cambio,
      }

      await docClient.send(new PutCommand({ TableName: TABLE.ventas, Item: venta }))
      return jsonResponse(201, venta)
    }

    // GET /ventas/:id — obtener venta por ID
    if (method === 'GET' && path.startsWith('/ventas/')) {
      requireRoles(event, ['CAJERO', 'SUPERVISOR', 'ADMIN'])
      const id = decodeURIComponent(path.slice('/ventas/'.length))
      if (!id) return errorResponse(400, 'ID requerido')

      const out = await docClient.send(new GetCommand({
        TableName: TABLE.ventas,
        Key: { id },
      }))
      if (!out.Item) return errorResponse(404, 'Venta no encontrada')
      return jsonResponse(200, out.Item)
    }

    return errorResponse(404, 'Ruta no encontrada')
  } catch (err) {
    const code = err.statusCode ?? 500
    if (code === 401) return errorResponse(401, 'No autenticado')
    if (code === 403) return errorResponse(403, 'Sin permiso')
    console.error(err)
    return errorResponse(500, 'Error interno del servidor')
  }
}
