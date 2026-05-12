'use strict'

const { v4: uuidv4 } = require('uuid')

/**
 * Extrae el X-Correlation-ID del evento Lambda o genera uno nuevo.
 * Permite trazabilidad distribuida entre servicios.
 *
 * @param {object} event - Evento Lambda de API Gateway
 * @returns {string} Correlation ID existente o nuevo UUID v4
 *
 * @example
 * const correlationId = extractCorrelationId(event)
 * // Usa el ID del cliente si viene en el header, o genera uno nuevo
 */
function extractCorrelationId(event) {
  const headers = event.headers || {}

  return (
    headers['X-Correlation-ID'] ||
    headers['x-correlation-id'] ||
    uuidv4()
  )
}

module.exports = { extractCorrelationId }
