import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { docClient, TABLE } from '../lib/dynamo.mjs'
import { requireRoles } from '../lib/auth.mjs'
import { errorResponse, handleOptions, jsonResponse } from '../lib/http.mjs'

function getPath(event) {
  return event.rawPath ?? event.path ?? event.requestContext?.http?.path ?? ''
}

function getQuery(event) {
  return event.queryStringParameters ?? {}
}

/**
 * Escanea ventas en un rango de fechas usando el GSI fecha-index.
 * fecha es YYYY-MM-DD (partition key del GSI), created_at es el sort key.
 */
async function queryVentasPorRango(desde, hasta) {
  // Generar lista de fechas en el rango (YYYY-MM-DD)
  const fechas = []
  const d = new Date(desde)
  const h = new Date(hasta)
  while (d <= h) {
    fechas.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }

  // Si el rango es muy amplio (>90 días), hacer scan completo con filtro
  if (fechas.length > 90) {
    return scanVentasFiltradas(desde, hasta)
  }

  const all = []
  for (const fecha of fechas) {
    try {
      const out = await docClient.send(new QueryCommand({
        TableName: TABLE.ventas,
        IndexName: 'fecha-index',
        KeyConditionExpression: 'fecha = :f AND created_at BETWEEN :desde AND :hasta',
        ExpressionAttributeValues: {
          ':f': fecha,
          ':desde': desde,
          ':hasta': hasta,
        },
      }))
      all.push(...(out.Items ?? []))
    } catch {
      // GSI no disponible en local — fallback a scan
      return scanVentasFiltradas(desde, hasta)
    }
  }
  return all
}

async function scanVentasFiltradas(desde, hasta) {
  const items = []
  let startKey
  do {
    const out = await docClient.send(new ScanCommand({
      TableName: TABLE.ventas,
      FilterExpression: 'created_at BETWEEN :desde AND :hasta',
      ExpressionAttributeValues: { ':desde': desde, ':hasta': hasta },
      ExclusiveStartKey: startKey,
    }))
    items.push(...(out.Items ?? []))
    startKey = out.LastEvaluatedKey
  } while (startKey)
  return items
}

function round2(n) {
  return Math.round(n * 100) / 100
}

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return handleOptions()
  }

  const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'GET'
  const path = getPath(event)

  try {
    // Solo SUPERVISOR y ADMIN — Req-10 (10.5)
    requireRoles(event, ['SUPERVISOR', 'ADMIN'])

    // GET /reportes/ventas?desde=2026-01-01&hasta=2026-12-31 — Req-10
    if (method === 'GET' && path === '/reportes/ventas') {
      const query = getQuery(event)
      const desde = String(query.desde ?? '').trim()
      const hasta = String(query.hasta ?? '').trim()

      if (!desde || !hasta) {
        return errorResponse(400, 'Parámetros requeridos: desde, hasta (YYYY-MM-DD o ISO 8601)')
      }

      // Normalizar a ISO 8601 completo para comparación con created_at
      const desdeISO = desde.length === 10 ? `${desde}T00:00:00.000Z` : desde
      const hastaISO = hasta.length === 10 ? `${hasta}T23:59:59.999Z` : hasta

      const ventas = await queryVentasPorRango(desdeISO, hastaISO)

      // Agregar totales — Req-10 (10.2)
      let montoTotal = 0
      const desglosePorMetodo = {}

      for (const v of ventas) {
        const total = Number(v.total_con_iva ?? 0)
        montoTotal += total
        const metodo = v.metodo_pago ?? 'DESCONOCIDO'
        desglosePorMetodo[metodo] = round2((desglosePorMetodo[metodo] ?? 0) + total)
      }

      // Ordenar por fecha descendente
      ventas.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))

      return jsonResponse(200, {
        total_ventas: ventas.length,
        monto_total: round2(montoTotal),
        desglose_por_metodo: desglosePorMetodo,
        ventas,
      })
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
