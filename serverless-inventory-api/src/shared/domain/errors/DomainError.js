'use strict'

/**
 * Clase base para todos los errores de dominio del sistema.
 * Extiende Error nativo con código de error y código HTTP.
 */
class DomainError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {string} code - Código identificador del error (ej: 'NOT_FOUND')
   * @param {number} statusCode - Código HTTP correspondiente (ej: 404)
   */
  constructor(message, code, statusCode) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode

    // Mantiene el stack trace correcto en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

module.exports = DomainError
