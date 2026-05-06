'use strict'

const DomainError = require('./DomainError')

/**
 * Error lanzado cuando un recurso no es encontrado en el sistema.
 * Corresponde a HTTP 404.
 *
 * @example
 * throw new NotFoundError('Producto')
 * // message: "Producto no encontrado"
 * // code: "NOT_FOUND"
 * // statusCode: 404
 */
class NotFoundError extends DomainError {
  /**
   * @param {string} resource - Nombre del recurso no encontrado (ej: 'Producto', 'Cliente')
   */
  constructor(resource) {
    super(`${resource} no encontrado`, 'NOT_FOUND', 404)
  }
}

module.exports = NotFoundError
