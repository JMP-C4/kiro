import { randomUUID } from 'node:crypto'
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import bcrypt from 'bcryptjs'
import { docClient, TABLE } from '../lib/dynamo.mjs'
import { requireRoles } from '../lib/auth.mjs'
import { errorResponse, handleOptions, jsonResponse } from '../lib/http.mjs'

function parseBody(event) {
  if (!event.body) return {}
  if (typeof event.body === 'object') return event.body
  try { return JSON.parse(event.body) } catch { return null }
}

function getPath(event) {
  return event.rawPath ?? event.path ?? event.requestContext?.http?.path ?? ''
}

function getUsernameFromPath(event) {
  const id = event.pathParameters?.username ?? event.pathParameters?.id
  if (id) return decodeURIComponent(String(id))
  const path = getPath(event)
  if (path.startsWith('/usuarios/')) return decodeURIComponent(path.slice('/usuarios/'.length))
  return ''
}

/** Nunca exponer password_hash — P-07 */
function toResponse(item) {
  return {
    id: item.id,
    username: item.username,
    nombre: item.nombre,
    apellido: item.apellido,
    rol: item.rol,
    activo: item.activo !== false,
    created_at: item.created_at,
  }
}

async function scanAll() {
  const items = []
  let startKey
  do {
    const out = await docClient.send(new ScanCommand({
      TableName: TABLE.usuarios,
      ExclusiveStartKey: startKey,
    }))
    items.push(...(out.Items ?? []))
    startKey = out.LastEvaluatedKey
  } while (startKey)
  return items
}

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return handleOptions()
  }

  const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'GET'
  const path = getPath(event)

  try {
    // Solo ADMIN puede acceder a /usuarios — Req-9, RNF-07
    requireRoles(event, ['ADMIN'])

    // GET /usuarios — listar todos
    if (method === 'GET' && path === '/usuarios') {
      const all = await scanAll()
      return jsonResponse(200, all.map(toResponse))
    }

    // POST /usuarios — crear usuario
    if (method === 'POST' && path === '/usuarios') {
      const body = parseBody(event)
      if (body === null) return errorResponse(400, 'JSON inválido')

      const username = String(body.username ?? '').trim().toLowerCase()
      const nombre = String(body.nombre ?? '').trim()
      const apellido = String(body.apellido ?? '').trim()
      const password = String(body.password ?? '')
      const rol = String(body.rol ?? '').toUpperCase()

      if (!username || !nombre || !apellido || !password || !rol) {
        return errorResponse(400, 'Campos obligatorios: username, nombre, apellido, password, rol')
      }
      if (!['CAJERO', 'SUPERVISOR', 'ADMIN'].includes(rol)) {
        return errorResponse(400, 'Rol inválido. Valores permitidos: CAJERO, SUPERVISOR, ADMIN')
      }

      // Verificar duplicado — Req-9 (9.5)
      const existing = await docClient.send(new GetCommand({
        TableName: TABLE.usuarios,
        Key: { username },
      }))
      if (existing.Item) return errorResponse(409, 'Ya existe un usuario con ese username')

      const password_hash = await bcrypt.hash(password, 10) // RNF-06
      const now = new Date().toISOString()
      const item = {
        username,
        id: `usr-${randomUUID().slice(0, 8)}`,
        nombre,
        apellido,
        password_hash,
        rol,
        activo: body.activo !== false,
        created_at: now,
      }

      await docClient.send(new PutCommand({ TableName: TABLE.usuarios, Item: item }))
      return jsonResponse(201, toResponse(item))
    }

    // PUT /usuarios/:username — actualizar usuario
    if (method === 'PUT' && path.startsWith('/usuarios/')) {
      const username = getUsernameFromPath(event)
      if (!username) return errorResponse(400, 'Username requerido')

      const existing = await docClient.send(new GetCommand({
        TableName: TABLE.usuarios,
        Key: { username },
      }))
      if (!existing.Item) return errorResponse(404, 'Usuario no encontrado')

      const body = parseBody(event)
      if (body === null) return errorResponse(400, 'JSON inválido')

      const item = { ...existing.Item }
      if (body.nombre != null) item.nombre = String(body.nombre).trim()
      if (body.apellido != null) item.apellido = String(body.apellido).trim()
      if (body.rol != null) {
        const rol = String(body.rol).toUpperCase()
        if (!['CAJERO', 'SUPERVISOR', 'ADMIN'].includes(rol)) {
          return errorResponse(400, 'Rol inválido')
        }
        item.rol = rol
      }
      if (body.activo !== undefined) item.activo = !!body.activo
      if (body.password && String(body.password).trim()) {
        item.password_hash = await bcrypt.hash(String(body.password), 10)
      }

      await docClient.send(new PutCommand({ TableName: TABLE.usuarios, Item: item }))
      return jsonResponse(200, toResponse(item))
    }

    // DELETE /usuarios/:username — desactivar lógico — Req-9 (9.4)
    if (method === 'DELETE' && path.startsWith('/usuarios/')) {
      const username = getUsernameFromPath(event)
      if (!username) return errorResponse(400, 'Username requerido')

      const existing = await docClient.send(new GetCommand({
        TableName: TABLE.usuarios,
        Key: { username },
      }))
      if (!existing.Item) return errorResponse(404, 'Usuario no encontrado')

      const item = { ...existing.Item, activo: false }
      await docClient.send(new PutCommand({ TableName: TABLE.usuarios, Item: item }))
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
