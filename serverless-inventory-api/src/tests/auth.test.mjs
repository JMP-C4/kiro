/**
 * Tests de autenticación y autorización — backend Lambda
 *
 * Verifica:
 *   P-06: CAJERO no puede POST/PUT/DELETE /productos → 403
 *   P-07: password_hash nunca se expone en respuestas
 *   P-10: JWT expirado → 401
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// ── Top-level imports ─────────────────────────────────────────────────────────
import { signToken, verifyToken } from '../lib/jwt.mjs'
import { requireRoles, requireAuth } from '../lib/auth.mjs'
import { docClient } from '../lib/dynamo.mjs'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEvent({ method = 'GET', path = '/', headers = {}, body = null, query = {} } = {}) {
  return {
    httpMethod: method,
    rawPath: path,
    path,
    queryStringParameters: query,
    headers,
    body: body ? JSON.stringify(body) : null,
    requestContext: { http: { method, path } },
  }
}

function authHeader(token) {
  return { authorization: `Bearer ${token}` }
}

function tokenFor(rol) {
  return signToken({ username: `test-${rol.toLowerCase()}`, rol, nombre: `Test ${rol}` })
}

// ── Tests: jwt.mjs ────────────────────────────────────────────────────────────

describe('jwt.mjs', () => {
  it('signToken genera un token verificable', () => {
    const token = tokenFor('CAJERO')
    const payload = verifyToken(token)
    assert.equal(payload.sub, 'test-cajero')
    assert.equal(payload.rol, 'CAJERO')
  })

  it('verifyToken lanza con token inválido', () => {
    assert.throws(() => verifyToken('token.invalido.xxx'), /invalid/i)
  })

  it('P-10: verifyToken lanza con token expirado', () => {
    const secret = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me-in-production-32chars'
    const expired = jwt.sign({ sub: 'u', rol: 'CAJERO', nombre: 'X' }, secret, { expiresIn: -1 })
    assert.throws(() => verifyToken(expired), /expired/i)
  })
})

// ── Tests: auth.mjs ───────────────────────────────────────────────────────────

describe('auth.mjs — requireRoles', () => {
  it('requireAuth lanza 401 sin token', () => {
    const event = makeEvent()
    try {
      requireAuth(event)
      assert.fail('Debería haber lanzado')
    } catch (err) {
      assert.equal(err.statusCode, 401)
    }
  })

  it('requireAuth lanza 401 con token malformado', () => {
    const event = makeEvent({ headers: authHeader('not.a.valid.token') })
    try {
      requireAuth(event)
      assert.fail('Debería haber lanzado')
    } catch (err) {
      assert.equal(err.statusCode, 401)
    }
  })

  it('requireAuth retorna payload con token válido', () => {
    const token = tokenFor('ADMIN')
    const event = makeEvent({ headers: authHeader(token) })
    const user = requireAuth(event)
    assert.equal(user.rol, 'ADMIN')
  })

  it('P-06: requireRoles lanza 403 cuando el rol no está permitido', () => {
    const token = tokenFor('CAJERO')
    const event = makeEvent({ headers: authHeader(token) })
    try {
      requireRoles(event, ['ADMIN'])
      assert.fail('Debería haber lanzado')
    } catch (err) {
      assert.equal(err.statusCode, 403)
    }
  })

  it('requireRoles pasa cuando el rol está en la lista', () => {
    const token = tokenFor('SUPERVISOR')
    const event = makeEvent({ headers: authHeader(token) })
    const user = requireRoles(event, ['SUPERVISOR', 'ADMIN'])
    assert.equal(user.rol, 'SUPERVISOR')
  })
})

// ── Tests: login handler ──────────────────────────────────────────────────────

describe('login handler', () => {
  let handler
  let passwordHash

  before(async () => {
    passwordHash = await bcrypt.hash('password123', 10)

    // Usuarios de prueba en memoria
    const DB = {
      'admin': { username: 'admin', nombre: 'Admin', apellido: 'Test', rol: 'ADMIN', activo: true, password_hash: passwordHash },
      'inactivo': { username: 'inactivo', nombre: 'Inactivo', apellido: 'Test', rol: 'CAJERO', activo: false, password_hash: passwordHash },
    }

    // Mock docClient.send
    docClient.send = async (cmd) => {
      if (cmd.constructor.name === 'GetCommand') {
        const key = cmd.input?.Key?.username
        return { Item: DB[key] ?? undefined }
      }
      return {}
    }

    const mod = await import('../handlers/login.mjs')
    handler = mod.handler
  })

  it('retorna 400 si faltan credenciales', async () => {
    const event = makeEvent({ method: 'POST', path: '/auth/login', body: {} })
    const res = await handler(event)
    assert.equal(res.statusCode, 400)
  })

  it('retorna 401 con usuario inexistente', async () => {
    const event = makeEvent({ method: 'POST', path: '/auth/login', body: { username: 'noexiste', password: 'x' } })
    const res = await handler(event)
    assert.equal(res.statusCode, 401)
    const body = JSON.parse(res.body)
    assert.equal(body.mensaje, 'Credenciales inválidas')
  })

  it('retorna 401 con contraseña incorrecta', async () => {
    const event = makeEvent({ method: 'POST', path: '/auth/login', body: { username: 'admin', password: 'wrong' } })
    const res = await handler(event)
    assert.equal(res.statusCode, 401)
  })

  it('retorna 403 con usuario inactivo', async () => {
    const event = makeEvent({ method: 'POST', path: '/auth/login', body: { username: 'inactivo', password: 'password123' } })
    const res = await handler(event)
    assert.equal(res.statusCode, 403)
    const body = JSON.parse(res.body)
    assert.equal(body.mensaje, 'Usuario inactivo')
  })

  it('retorna 200 con token en login válido', async () => {
    const event = makeEvent({ method: 'POST', path: '/auth/login', body: { username: 'admin', password: 'password123' } })
    const res = await handler(event)
    assert.equal(res.statusCode, 200)
    const body = JSON.parse(res.body)
    assert.ok(body.token, 'Debe incluir token')
    assert.equal(body.rol, 'ADMIN')
  })

  it('P-07: la respuesta nunca expone password_hash', async () => {
    const event = makeEvent({ method: 'POST', path: '/auth/login', body: { username: 'admin', password: 'password123' } })
    const res = await handler(event)
    const body = JSON.parse(res.body)
    assert.ok(!('password_hash' in body))
    assert.ok(!JSON.stringify(body).includes('password_hash'))
  })
})

// ── Tests: P-06 — CAJERO no puede modificar /productos ───────────────────────

describe('P-06 — autorización por rol en /productos', () => {
  let handler

  before(async () => {
    // Mock DynamoDB para productos
    docClient.send = async (cmd) => {
      if (cmd.constructor.name === 'ScanCommand') return { Items: [] }
      if (cmd.constructor.name === 'QueryCommand') return { Items: [] }
      return { Items: [] }
    }
    const mod = await import('../handlers/productos.mjs')
    handler = mod.handler
  })

  it('CAJERO recibe 403 en POST /productos', async () => {
    const token = tokenFor('CAJERO')
    const event = makeEvent({
      method: 'POST', path: '/productos',
      headers: authHeader(token),
      body: { codigo: 'TEST-001', nombre: 'Test', precio: 1000 },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 403)
  })

  it('CAJERO recibe 403 en PUT /productos/:id', async () => {
    const token = tokenFor('CAJERO')
    const event = makeEvent({
      method: 'PUT', path: '/productos/prod-001',
      headers: authHeader(token),
      body: { nombre: 'Nuevo nombre' },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 403)
  })

  it('CAJERO recibe 403 en DELETE /productos/:id', async () => {
    const token = tokenFor('CAJERO')
    const event = makeEvent({
      method: 'DELETE', path: '/productos/prod-001',
      headers: authHeader(token),
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 403)
  })

  it('CAJERO puede GET /productos (200)', async () => {
    const token = tokenFor('CAJERO')
    const event = makeEvent({
      method: 'GET', path: '/productos',
      headers: authHeader(token),
      query: { q: 'arroz' },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 200)
  })

  it('sin token recibe 401 en GET /productos', async () => {
    const event = makeEvent({ method: 'GET', path: '/productos', query: { q: 'x' } })
    const res = await handler(event)
    assert.equal(res.statusCode, 401)
  })
})
