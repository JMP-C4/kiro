'use strict'

const DomainError = require('./DomainError')

/**
 * Error lanzado cuando una operación entra en conflicto con el estado actual del sistema.
 * Corresponde a HTTP 409.
 *
 * @example
 * throw new ConflictError('El email ya está registrado')
 * // message: "El email ya está registrado"
 * // code: "CONFLICT"
 * // statusCode: 409
 *
 * @example
 * throw new ConflictError('Stock insuficiente para el producto: abc-123', 'INSUFFICIENT_STOCK')
 * // code: "INSUFFICIENT_STOCK"
 */
class ConflictError extends DomainError {
  /**
   * @param {string} message - Descripción del conflicto
   * @param {string} [code='CONFLICT'] - Código específico del conflicto (opcional)
   */
  constructor(message, code = 'CONFLICT') {
    super(message, code, 409)
  }
}

module.exports = ConflictError
