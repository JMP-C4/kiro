/**
 * API local para desarrollo — emula API Gateway + Lambda.
 * DynamoDB Local :8000, API :3000 (override con PORT).
 *
 * Rutas disponibles:
 *   GET  /health
 *   POST /auth/login
 *   GET  /productos?q=…  (POS) | GET /productos?page=0&size=50 (admin)
 *   POST /productos  PUT /productos/:id  DELETE /productos/:id
 *   GET  /usuarios  POST /usuarios  PUT /usuarios/:username  DELETE /usuarios/:username
 *   POST /ventas  GET /ventas/:id
 *   GET  /reportes/ventas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 *   GET  /configuracion  PUT /configuracion
 */
import http from 'node:http'

process.env.DYNAMODB_ENDPOINT ??= 'http://localhost:8000'
process.env.PORT ??= '3000'

const { handler: loginHandler }         = await import('./handlers/login.mjs')
const { handler: healthHandler }        = await import('./handlers/health.mjs')
const { handler: productosHandler }     = await import('./handlers/productos.mjs')
const { handler: usuariosHandler }      = await import('./handlers/usuarios.mjs')
const { handler: ventasHandler }        = await import('./handlers/ventas.mjs')
const { handler: reportesHandler }      = await import('./handlers/reportes.mjs')
const { handler: configuracionHandler } = await import('./handlers/configuracion.mjs')
const { handleOptions, sendNodeResponse } = await import('./lib/http.mjs')

const PORT = Number(process.env.PORT)

function collectHeaders(req) {
  const h = {}
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue
    h[k] = Array.isArray(v) ? v.join(',') : v
  }
  return h
}

function buildEvent(method, url, body, headers) {
  const u = new URL(url || '/', 'http://localhost')
  const queryStringParameters = {}
  u.searchParams.forEach((value, key) => { queryStringParameters[key] = value })

  // Extraer pathParameters para rutas con segmentos dinámicos
  const pathParameters = {}
  const productosMatch = u.pathname.match(/^\/productos\/(.+)$/)
  const usuariosMatch  = u.pathname.match(/^\/usuarios\/(.+)$/)
  const ventasMatch    = u.pathname.match(/^\/ventas\/(.+)$/)
  if (productosMatch) pathParameters.id = decodeURIComponent(productosMatch[1])
  if (usuariosMatch)  pathParameters.username = decodeURIComponent(usuariosMatch[1])
  if (ventasMatch)    pathParameters.id = decodeURIComponent(ventasMatch[1])

  return {
    httpMethod: method,
    rawPath: u.pathname,
    path: u.pathname,
    queryStringParameters,
    pathParameters,
    headers,
    body,
    requestContext: { http: { method, path: u.pathname } },
  }
}

function findHandler(method, pathname) {
  if (method === 'GET'    && pathname === '/health')              return healthHandler
  if (method === 'POST'   && pathname === '/auth/login')          return loginHandler
  if (method === 'GET'    && pathname === '/productos')           return productosHandler
  if (method === 'POST'   && pathname === '/productos')           return productosHandler
  if (method === 'PUT'    && pathname.startsWith('/productos/'))  return productosHandler
  if (method === 'DELETE' && pathname.startsWith('/productos/'))  return productosHandler
  if (method === 'GET'    && pathname === '/usuarios')            return usuariosHandler
  if (method === 'POST'   && pathname === '/usuarios')            return usuariosHandler
  if (method === 'PUT'    && pathname.startsWith('/usuarios/'))   return usuariosHandler
  if (method === 'DELETE' && pathname.startsWith('/usuarios/'))   return usuariosHandler
  if (method === 'POST'   && pathname === '/ventas')              return ventasHandler
  if (method === 'GET'    && pathname.startsWith('/ventas/'))     return ventasHandler
  if (method === 'GET'    && pathname === '/reportes/ventas')     return reportesHandler
  if (method === 'GET'    && pathname === '/configuracion')       return configuracionHandler
  if (method === 'PUT'    && pathname === '/configuracion')       return configuracionHandler
  return null
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw || null
}

const server = http.createServer(async (req, res) => {
  const method = req.method ?? 'GET'
  const url = req.url ?? '/'

  if (method === 'OPTIONS') {
    sendNodeResponse(res, handleOptions())
    return
  }

  const pathname = new URL(url, 'http://localhost').pathname
  const handler = findHandler(method, pathname)
  if (!handler) {
    sendNodeResponse(res, {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: 404, mensaje: 'Ruta no encontrada' }),
    })
    return
  }

  const body = (method === 'POST' || method === 'PUT') ? await readBody(req) : null
  const event = buildEvent(method, url, body, collectHeaders(req))

  try {
    const result = await handler(event)
    sendNodeResponse(res, result)
  } catch (err) {
    console.error(err)
    sendNodeResponse(res, {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: 500, mensaje: 'Error interno del servidor' }),
    })
  }
})

server.listen(PORT, () => {
  console.log(`\nPOS API local → http://localhost:${PORT}`)
  console.log(`  GET  /health`)
  console.log(`  POST /auth/login`)
  console.log(`  GET  /productos?q=…  |  GET /productos?page=0&size=50`)
  console.log(`  POST /productos  PUT /productos/:id  DELETE /productos/:id`)
  console.log(`  GET  /usuarios  POST /usuarios  PUT /usuarios/:username  DELETE /usuarios/:username`)
  console.log(`  POST /ventas  GET /ventas/:id`)
  console.log(`  GET  /reportes/ventas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`)
  console.log(`  GET  /configuracion  PUT /configuracion`)
  console.log(`DynamoDB → ${process.env.DYNAMODB_ENDPOINT}\n`)
})
