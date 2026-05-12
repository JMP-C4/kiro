'use strict'

const { v4: uuidv4 } = require('uuid')

/**
 * Value Object que genera y encapsula identificadores únicos UUID v4.
 *
 * @example
 * const id = UniqueId.generate()
 * // "550e8400-e29b-41d4-a716-446655440000"
 */
class UniqueId {
  /**
   * Genera un nuevo UUID v4 único.
   * @returns {string} UUID v4 como string
   */
  static generate() {
    return uuidv4()
  }
}

module.exports = UniqueId
