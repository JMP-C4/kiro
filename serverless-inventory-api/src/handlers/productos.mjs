import { randomUUID } from 'node:crypto'
import {
  ScanCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { docClient, TABLE } from '../lib/dynamo.mjs'
import { errorResponse, handleOptions, jsonResponse } from '../lib/http.mjs'
import { requireRoles } from '../lib/auth.mjs'

function parseBody(event) {
  if (!event.body) return {}
  if (typeof event.body === 'object') return event.body
  try {
    return JSON.parse(event.body)
  } catch {
    return null
  }
}

function getPath(event) {
  return event.rawPath ?? event.path ?? event.requestContext?.http?.path ?? ''
}

function getProductoIdFromPath(event) {
  const id = event.pathParameters?.id
  if (id) return decodeURIComponent(String(id))
  const path = getPath(event)
  if (path.startsWith('/productos/')) {
    return decodeURIComponent(path.slice('/productos/'.length))
  }
  return ''
}

function getQuery(event) {
  const q = event.queryStringParameters
  if (q && typeof q === 'object') return q
  return {}
}

async function scanAllProductos() {
  const items = []
  let startKey
  do {
    const out = await docClient.send(
      new ScanCommand({
        TableName: TABLE.productos,
        ExclusiveStartKey: startKey,
      })
    )
    items.push(...(out.Items ?? []))
    startKey = out.LastEvaluatedKey
  } while (startKey)
  return items
}

/**
 * Busca un producto por código de barras exacto usando el GSI codigo-index.
 * O(1) — no hace scan completo. Ideal para lectores de código de barras.
 */
async function buscarPorCodigoExacto(codigo) {
  try {
    const out = await docClient.send(new QueryCommand({
      TableName: TABLE.productos,
      IndexName: 'codigo-index',
      KeyConditionExpression: 'codigo = :c',
      ExpressionAttributeValues: { ':c': codigo },
      Limit: 1,
    }))
    return out.Items ?? []
  } catch {
    // GSI no disponible (DynamoDB Local sin índice) — fallback a scan
    return null
  }
}

function toProducto(item) {
  return {
    id: item.id,
    codigo: item.codigo,
    nombre: item.nombre,
    descripcion: item.descripcion ?? undefined,
    categoria: item.categoria ?? undefined,
    precio: Number(item.precio),
    incluye_iva: !!item.incluye_iva,
    unidad_medida: item.unidad_medida ?? 'und',
    activo: item.activo !== false,
  }
}

function toSearchResult(item) {
  return {
    id: item.id,
    codigo: item.codigo,
    nombre: item.nombre,
    precio: Number(item.precio),
    incluye_iva: !!item.incluye_iva,
    unidad_medida: item.unidad_medida ?? 'und',
  }
}

/**
 * Detecta si el query parece un código de barras:
 * - Solo dígitos (EAN-13, EAN-8, UPC-A, UPC-E, ITF-14)
 * - O alfanumérico sin espacios de longitud >= 6 (códigos internos)
 */
function pareceCodigoBarras(q) {
  return /^\d{6,}$/.test(q) || /^[A-Z0-9\-_.]{6,}$/i.test(q)
}

function matchesQuery(item, needle) {
  const n = needle.trim().toLowerCase()
  const codigo = String(item.codigo ?? '').toLowerCase()
  const nombre = String(item.nombre ?? '').toLowerCase()
  return codigo.includes(n) || nombre.includes(n)
}

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return handleOptions()
  }

  const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'GET'
  const path = getPath(event)

  try {
    if (method === 'GET' && path === '/productos') {
      requireRoles(event, ['CAJERO', 'SUPERVISOR', 'ADMIN'])
      const query = getQuery(event)
      const qRaw = query.q != null ? String(query.q) : ''
      const q = qRaw.trim() !== '' ? qRaw.trim() : null
      const hasPage = query.page !== undefined && query.page !== null && String(query.page).trim() !== ''

      // ── POS: búsqueda sin paginación (?q= sin ?page=) ──────────────────
      if (q && !hasPage) {
        // Estrategia 1: si parece código de barras → Query exacto por GSI (O(1))
        // El lector envía el código completo; queremos match exacto y respuesta < 300ms
        if (pareceCodigoBarras(q)) {
          const exactos = await buscarPorCodigoExacto(q)
          if (exactos !== null) {
            // GSI disponible — devolver solo activos
            const activos = exactos.filter((p) => p.activo !== false).map(toSearchResult)
            if (activos.length > 0) return jsonResponse(200, activos)
            // Código no encontrado exacto → caer a búsqueda parcial por nombre
          }
        }

        // Estrategia 2: búsqueda parcial por nombre/código (Scan con filtro)
        const all = await scanAllProductos()
        const results = all
          .filter((p) => p.activo !== false)
          .filter((p) => matchesQuery(p, q))
          .map(toSearchResult)
        return jsonResponse(200, results)
      }

      // ── Admin: listado paginado (?page= presente) ───────────────────────
      const all = await scanAllProductos()
      const page = Math.max(0, Number.parseInt(String(query.page ?? '0'), 10) || 0)
      const size = Math.min(100, Math.max(1, Number.parseInt(String(query.size ?? '50'), 10) || 50))
      let list = all
      if (q) {
        list = list.filter((p) => matchesQuery(p, q))
      }
      list.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)))
      const totalElements = list.length
      const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size)
      const slice = list.slice(page * size, page * size + size).map(toProducto)

      return jsonResponse(200, {
        content: slice,
        totalElements,
        totalPages,
        number: page,
        size,
      })
    }

    if (method === 'POST' && path === '/productos') {
      requireRoles(event, ['ADMIN'])
      const body = parseBody(event)
      if (body === null) return errorResponse(400, 'JSON inválido')

      const codigo = String(body.codigo ?? '').trim()
      const nombre = String(body.nombre ?? '').trim()
      if (!codigo || !nombre) {
        return errorResponse(400, 'Código y nombre son obligatorios')
      }

      const all = await scanAllProductos()
      if (all.some((p) => String(p.codigo).toLowerCase() === codigo.toLowerCase())) {
        return errorResponse(409, 'Ya existe un producto con ese código')
      }

      const id = `prod-${randomUUID().slice(0, 8)}`
      const now = new Date().toISOString()
      const item = {
        id,
        codigo,
        nombre,
        descripcion: body.descripcion ?? null,
        categoria: body.categoria ?? null,
        precio: Number(body.precio),
        incluye_iva: !!body.incluye_iva,
        unidad_medida: String(body.unidad_medida ?? 'und'),
        activo: true,
        created_at: now,
      }

      if (!Number.isFinite(item.precio) || item.precio <= 0) {
        return errorResponse(400, 'Precio inválido')
      }

      await docClient.send(new PutCommand({ TableName: TABLE.productos, Item: item }))
      return jsonResponse(201, toProducto(item))
    }

    if (method === 'PUT' && path.startsWith('/productos/')) {
      requireRoles(event, ['ADMIN'])
      const id = getProductoIdFromPath(event)
      if (!id) return errorResponse(400, 'ID requerido')

      const body = parseBody(event)
      if (body === null) return errorResponse(400, 'JSON inválido')

      const existing = await docClient.send(
        new GetCommand({ TableName: TABLE.productos, Key: { id } })
      )
      if (!existing.Item) {
        return errorResponse(404, 'Producto no encontrado')
      }

      const newCodigo = String(body.codigo ?? existing.Item.codigo).trim()
      const all = await scanAllProductos()
      if (all.some((p) => p.id !== id && String(p.codigo).toLowerCase() === newCodigo.toLowerCase())) {
        return errorResponse(409, 'Ya existe otro producto con ese código')
      }

      const item = {
        ...existing.Item,
        codigo: newCodigo,
        nombre: String(body.nombre ?? existing.Item.nombre).trim(),
        descripcion: body.descripcion !== undefined ? body.descripcion : existing.Item.descripcion,
        categoria: body.categoria !== undefined ? body.categoria : existing.Item.categoria,
        precio: body.precio !== undefined ? Number(body.precio) : Number(existing.Item.precio),
        incluye_iva: body.incluye_iva !== undefined ? !!body.incluye_iva : !!existing.Item.incluye_iva,
        unidad_medida: body.unidad_medida != null ? String(body.unidad_medida) : existing.Item.unidad_medida,
      }

      if (!Number.isFinite(item.precio) || item.precio <= 0) {
        return errorResponse(400, 'Precio inválido')
      }

      await docClient.send(new PutCommand({ TableName: TABLE.productos, Item: item }))
      return jsonResponse(200, toProducto(item))
    }

    if (method === 'DELETE' && path.startsWith('/productos/')) {
      requireRoles(event, ['ADMIN'])
      const id = getProductoIdFromPath(event)
      if (!id) return errorResponse(400, 'ID requerido')
      const existing = await docClient.send(
        new GetCommand({ TableName: TABLE.productos, Key: { id } })
      )
      if (!existing.Item) {
        return errorResponse(404, 'Producto no encontrado')
      }

      const item = { ...existing.Item, activo: false }
      await docClient.send(new PutCommand({ TableName: TABLE.productos, Item: item }))
      return jsonResponse(200, { ok: true })
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
