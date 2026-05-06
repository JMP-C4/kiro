'use strict'

const DomainError = require('./DomainError')

/**
 * Error lanzado cuando los datos de entrada no cumplen las reglas de validación.
 * Corresponde a HTTP 400.
 *
 * @example
 * throw new ValidationError('El precio debe ser mayor a 0')
 * // message: "El precio debe ser mayor a 0"
 * // code: "VALIDATION_ERROR"
 * // statusCode: 400
 */
class ValidationError extends DomainError {
  /**
   * @param {string} message - Descripción del error de validación
   */
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

module.exports = ValidationError
