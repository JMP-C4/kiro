'use strict'

const DomainError = require('../domain/errors/DomainError')
const ResponseBuilder = require('../infrastructure/ResponseBuilder')

/**
 * Middleware global de manejo de errores.
 * Mapea DomainError a respuestas HTTP estructuradas.
 * Para errores no controlados, loguea el stack trace y retorna 500 genérico.
 *
 * @param {Error} error - Error capturado
 * @param {string} [correlationId] - X-Correlation-ID para trazabilidad
 * @returns {object} Respuesta Lambda con statusCode, headers y body
 *
 * @example
 * try {
 *   // lógica del handler
 * } catch (error) {
 *   return errorHandler(error, correlationId)
 * }
 */
function errorHandler(error, correlationId) {
  if (error instanceof DomainError) {
    return ResponseBuilder.error(
      error.statusCode,
      error.message,
      error.code,
      correlationId
    )
  }

  // Error no controlado: loguear completo, responder genérico
  console.error(JSON.stringify({
    level: 'ERROR',
    message: 'Unhandled exception',
    error: error.message,
    stack: error.stack,
    correlationId,
    timestamp: new Date().toISOString()
  }))

  return ResponseBuilder.error(
    500,
    'Error interno del servidor',
    'INTERNAL_ERROR',
    correlationId
  )
}

module.exports = { errorHandler }
