import bcrypt from 'bcryptjs'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { docClient, TABLE } from '../lib/dynamo.mjs'
import { signToken } from '../lib/jwt.mjs'
import { errorResponse, handleOptions, jsonResponse } from '../lib/http.mjs'

function parseBody(event) {
  if (!event.body) return {}
  if (typeof event.body === 'object') return event.body
  try {
    return JSON.parse(event.body)
  } catch {
    return null
  }
}

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return handleOptions()
  }

  const body = parseBody(event)
  if (body === null) {
    return errorResponse(400, 'JSON inválido')
  }

  const username = String(body.username ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!username || !password) {
    return errorResponse(400, 'Usuario y contraseña son obligatorios')
  }

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE.usuarios,
      Key: { username },
    })
  )

  const user = result.Item
  if (!user) {
    return errorResponse(401, 'Credenciales inválidas')
  }

  if (user.activo === false) {
    return errorResponse(403, 'Usuario inactivo')
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return errorResponse(401, 'Credenciales inválidas')
  }

  const nombre = [user.nombre, user.apellido].filter(Boolean).join(' ').trim()
  const token = signToken({ username, rol: user.rol, nombre })

  return jsonResponse(200, {
    token,
    rol: user.rol,
    nombre,
  })
}
