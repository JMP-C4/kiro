import { handleOptions, jsonResponse } from '../lib/http.mjs'

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return handleOptions()
  }

  return jsonResponse(200, {
    status: 'ok',
    version: process.env.APP_VERSION ?? '0.1.0',
  })
}
