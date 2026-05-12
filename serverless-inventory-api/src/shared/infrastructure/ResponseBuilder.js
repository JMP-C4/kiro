'use strict'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Correlation-ID',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

/**
 * Construye respuestas HTTP estandarizadas para Lambda + API Gateway.
 * Todas las respuestas incluyen headers CORS y Content-Type: application/json.
 */
class ResponseBuilder {
  /**
   * HTTP 200 OK
   * @param {*} data - Cuerpo de la respuesta
   * @param {string} [correlationId] - X-Correlation-ID para trazabilidad
   * @returns {object} Respuesta Lambda
   */
  static ok(data, correlationId) {
    return ResponseBuilder._build(200, data, correlationId)
  }

  /**
   * HTTP 201 Created
   * @param {*} data - Recurso creado
   * @param {string} [correlationId]
   * @returns {object} Respuesta Lambda
   */
  static created(data, correlationId) {
    return ResponseBuilder._build(201, data, correlationId)
  }

  /**
   * HTTP 200 con mensaje de éxito
   * @param {string} message - Mensaje descriptivo
   * @param {string} [correlationId]
   * @returns {object} Respuesta Lambda
   */
  static noContent(message, correlationId) {
    return ResponseBuilder._build(200, { message }, correlationId)
  }

  /**
   * Respuesta de error estructurada
   * @param {number} statusCode - Código HTTP (400, 404, 409, 500...)
   * @param {string} message - Mensaje descriptivo del error
   * @param {string} code - Código identificador del error (ej: 'NOT_FOUND')
   * @param {string} [correlationId]
   * @returns {object} Respuesta Lambda
   */
  static error(statusCode, message, code, correlationId) {
    return ResponseBuilder._build(statusCode, { error: message, codigo: code }, correlationId)
  }

  /**
   * @private
   */
  static _build(statusCode, body, correlationId) {
    const headers = { ...DEFAULT_HEADERS }
    if (correlationId) {
      headers['X-Correlation-ID'] = correlationId
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify(body)
    }
  }
}

module.exports = ResponseBuilder
