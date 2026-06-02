const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173'

export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  }
}

export function errorResponse(statusCode, mensaje) {
  return jsonResponse(statusCode, { codigo: statusCode, mensaje })
}

export function handleOptions() {
  return jsonResponse(204, '')
}

/** Adaptador mínimo para el servidor local (sin API Gateway). */
export function sendNodeResponse(res, lambdaResult) {
  const headers = lambdaResult.headers ?? {}
  for (const [key, value] of Object.entries(headers)) {
    if (value != null && value !== '') {
      res.setHeader(key, value)
    }
  }
  res.statusCode = lambdaResult.statusCode
  if (lambdaResult.body) res.end(lambdaResult.body)
  else res.end()
}
