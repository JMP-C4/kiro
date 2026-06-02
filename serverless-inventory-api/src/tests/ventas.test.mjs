/**
 * Tests de ventas — backend Lambda
 *
 * Verifica:
 *   P-08: numero_venta único con formato VTA-YYYYMMDD-NNNN
 *   P-12: ticket refleja exactamente los datos persistidos
 *   Cálculo de IVA en backend (validación independiente del frontend)
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { signToken } from '../lib/jwt.mjs'
import { docClient } from '../lib/dynamo.mjs'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEvent({ method = 'POST', path = '/ventas', headers = {}, body = null } = {}) {
  return {
    httpMethod: method,
    rawPath: path,
    path,
    queryStringParameters: {},
    headers,
    body: body ? JSON.stringify(body) : null,
    requestContext: { http: { method, path } },
  }
}

function tokenFor(rol) {
  return signToken({ username: 'cajero-test', rol, nombre: 'Cajero Test' })
}

function authHeader(token) {
  return { authorization: `Bearer ${token}` }
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const itemSinIVA = { nombre_producto: 'Banano', cantidad: 1, precio_unitario: 10000, incluye_iva: false, subtotal: 10000 }
const itemConIVA = { nombre_producto: 'Arroz', cantidad: 1, precio_unitario: 11900, incluye_iva: true, subtotal: 11900 }

// ── Setup mock DynamoDB ───────────────────────────────────────────────────────

let ventaCount = 0
const ventasStore = new Map()

let handler

before(async () => {
  docClient.send = async (cmd) => {
    const name = cmd.constructor.name
    if (name === 'PutCommand') {
      const item = cmd.input?.Item
      if (item?.id) ventasStore.set(item.id, item)
      return {}
    }
    if (name === 'QueryCommand') {
      return { Count: ventaCount, Items: [] }
    }
    if (name === 'GetCommand') {
      const key = cmd.input?.Key
      if (key?.id && ventasStore.has(key.id)) return { Item: ventasStore.get(key.id) }
      if (key?.username) {
        return { Item: { username: 'cajero-test', nombre: 'Cajero', apellido: 'Test', rol: 'CAJERO', activo: true } }
      }
      return { Item: undefined }
    }
    if (name === 'ScanCommand') {
      return { Items: [{ username: 'cajero-test', nombre: 'Cajero', apellido: 'Test', rol: 'CAJERO', activo: true }] }
    }
    return { Items: [] }
  }

  const mod = await import('../handlers/ventas.mjs')
  handler = mod.handler
})

// ── Tests: validación de entrada ──────────────────────────────────────────────

describe('POST /ventas — validación', () => {
  it('retorna 401 sin token', async () => {
    const event = makeEvent({ body: { items: [itemSinIVA], metodo_pago: 'EFECTIVO', descuento_pct: 0 } })
    const res = await handler(event)
    assert.equal(res.statusCode, 401)
  })

  it('retorna 400 con carrito vacío', async () => {
    const token = tokenFor('CAJERO')
    const event = makeEvent({ headers: authHeader(token), body: { items: [], metodo_pago: 'EFECTIVO', descuento_pct: 0 } })
    const res = await handler(event)
    assert.equal(res.statusCode, 400)
    assert.match(JSON.parse(res.body).mensaje, /ítem/i)
  })

  it('retorna 400 con método de pago inválido', async () => {
    const token = tokenFor('CAJERO')
    const event = makeEvent({ headers: authHeader(token), body: { items: [itemSinIVA], metodo_pago: 'BITCOIN', descuento_pct: 0 } })
    const res = await handler(event)
    assert.equal(res.statusCode, 400)
  })

  it('retorna 400 con monto recibido insuficiente', async () => {
    const token = tokenFor('CAJERO')
    const event = makeEvent({
      headers: authHeader(token),
      body: { items: [itemSinIVA], metodo_pago: 'EFECTIVO', descuento_pct: 0, monto_recibido: 100 },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 400)
    assert.match(JSON.parse(res.body).mensaje, /insuficiente/i)
  })
})

// ── Tests: cálculo de IVA ─────────────────────────────────────────────────────

describe('POST /ventas — cálculo de IVA', () => {
  const token = tokenFor('CAJERO')

  it('IVA excluido: total = precio * 1.19', async () => {
    const event = makeEvent({
      headers: authHeader(token),
      body: { items: [itemSinIVA], metodo_pago: 'TARJETA', descuento_pct: 0 },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 201)
    const v = JSON.parse(res.body)
    assert.ok(Math.abs(v.subtotal_sin_iva - 10000) < 0.01)
    assert.ok(Math.abs(v.iva_monto - 1900) < 0.01)
    assert.ok(Math.abs(v.total_con_iva - 11900) < 0.01)
  })

  it('IVA incluido: base = precio / 1.19, total = precio original', async () => {
    const event = makeEvent({
      headers: authHeader(token),
      body: { items: [itemConIVA], metodo_pago: 'TARJETA', descuento_pct: 0 },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 201)
    const v = JSON.parse(res.body)
    const expectedBase = 11900 / 1.19
    assert.ok(Math.abs(v.subtotal_sin_iva - expectedBase) < 0.01)
    assert.ok(Math.abs(v.total_con_iva - 11900) < 0.01)
  })

  it('descuento 10%: total = base * 0.9 * 1.19', async () => {
    const event = makeEvent({
      headers: authHeader(token),
      body: { items: [itemSinIVA], metodo_pago: 'TARJETA', descuento_pct: 0.10 },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 201)
    const v = JSON.parse(res.body)
    assert.ok(Math.abs(v.descuento_monto - 1000) < 0.01)
    assert.ok(Math.abs(v.total_con_iva - 10710) < 0.01)
  })

  it('cambio = monto_recibido - total', async () => {
    const event = makeEvent({
      headers: authHeader(token),
      body: { items: [itemSinIVA], metodo_pago: 'EFECTIVO', descuento_pct: 0, monto_recibido: 20000 },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 201)
    const v = JSON.parse(res.body)
    assert.ok(Math.abs(v.cambio - (20000 - 11900)) < 0.01)
  })
})

// ── Tests: P-08 — numero_venta único ─────────────────────────────────────────

describe('P-08 — numero_venta único', () => {
  const token = tokenFor('CAJERO')

  it('formato VTA-YYYYMMDD-NNNN', async () => {
    ventaCount = 0
    const event = makeEvent({
      headers: authHeader(token),
      body: { items: [itemSinIVA], metodo_pago: 'TARJETA', descuento_pct: 0 },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 201)
    const v = JSON.parse(res.body)
    assert.match(v.numero_venta, /^VTA-\d{8}-\d{4}$/)
  })

  it('incrementa el secuencial correctamente', async () => {
    ventaCount = 9
    const event = makeEvent({
      headers: authHeader(token),
      body: { items: [itemSinIVA], metodo_pago: 'TARJETA', descuento_pct: 0 },
    })
    const res = await handler(event)
    const v = JSON.parse(res.body)
    assert.match(v.numero_venta, /0010$/)
  })
})

// ── Tests: P-12 — ticket refleja datos persistidos ───────────────────────────

describe('P-12 — ticket refleja venta persistida', () => {
  const token = tokenFor('CAJERO')

  it('respuesta incluye todos los campos del ticket (Req-6.4)', async () => {
    const event = makeEvent({
      headers: authHeader(token),
      body: { items: [itemConIVA, itemSinIVA], metodo_pago: 'EFECTIVO', descuento_pct: 0, monto_recibido: 50000 },
    })
    const res = await handler(event)
    assert.equal(res.statusCode, 201)
    const v = JSON.parse(res.body)

    for (const campo of ['id', 'numero_venta', 'cajero_nombre', 'created_at', 'items',
                          'subtotal_sin_iva', 'iva_monto', 'total_con_iva', 'metodo_pago', 'cambio']) {
      assert.ok(v[campo] !== undefined, `Falta campo: ${campo}`)
    }
    assert.equal(v.items.length, 2)
  })

  it('ítems en respuesta coinciden con los enviados', async () => {
    const event = makeEvent({
      headers: authHeader(token),
      body: {
        items: [{ nombre_producto: 'Producto X', cantidad: 3, precio_unitario: 1000, incluye_iva: false, subtotal: 3000 }],
        metodo_pago: 'TARJETA', descuento_pct: 0,
      },
    })
    const res = await handler(event)
    const v = JSON.parse(res.body)
    assert.equal(v.items[0].nombre_producto, 'Producto X')
    assert.equal(v.items[0].cantidad, 3)
    assert.equal(v.items[0].precio_unitario, 1000)
  })
})
