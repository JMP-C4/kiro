import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
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

const CONFIG_KEY = { id: 'global' }

const DEFAULT_CONFIG = {
  id: 'global',
  nombre_negocio: 'Mi Supermercado',
  tasa_iva: 0.19,
  formato_papel: '80mm',
  logo_url: null,
  updated_at: new Date().toISOString(),
}

async function getOrCreate() {
  const out = await docClient.send(new GetCommand({
    TableName: TABLE.configuracion,
    Key: CONFIG_KEY,
  }))
  if (out.Item) return out.Item

  // Crear configuración por defecto si no existe
  await docClient.send(new PutCommand({ TableName: TABLE.configuracion, Item: DEFAULT_CONFIG }))
  return DEFAULT_CONFIG
}

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return handleOptions()
  }

  const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'GET'
  const path = getPath(event)

  try {
    // GET /configuracion — todos los roles autenticados — Req-11 (11.1)
    if (method === 'GET' && path === '/configuracion') {
      // Requiere al menos estar autenticado
      requireRoles(event, ['CAJERO', 'SUPERVISOR', 'ADMIN'])
      const config = await getOrCreate()
      return jsonResponse(200, config)
    }

    // PUT /configuracion — solo ADMIN — Req-11 (11.2, 11.6)
    if (method === 'PUT' && path === '/configuracion') {
      requireRoles(event, ['ADMIN'])
      const body = parseBody(event)
      if (body === null) return errorResponse(400, 'JSON inválido')

      const current = await getOrCreate()
      const updated = { ...current }

      if (body.nombre_negocio != null) updated.nombre_negocio = String(body.nombre_negocio).trim()
      if (body.tasa_iva != null) {
        const tasa = Number(body.tasa_iva)
        if (!Number.isFinite(tasa) || tasa < 0 || tasa > 1) {
          return errorResponse(400, 'tasa_iva debe ser un número entre 0 y 1 (ej: 0.19)')
        }
        updated.tasa_iva = tasa
      }
      if (body.formato_papel != null) {
        const formatos = ['80mm', '58mm', 'carta']
        if (!formatos.includes(body.formato_papel)) {
          return errorResponse(400, `formato_papel inválido. Valores: ${formatos.join(', ')}`)
        }
        updated.formato_papel = body.formato_papel
      }
      if (body.logo_url !== undefined) updated.logo_url = body.logo_url

      updated.updated_at = new Date().toISOString()

      await docClient.send(new PutCommand({ TableName: TABLE.configuracion, Item: updated }))
      return jsonResponse(200, updated)
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
