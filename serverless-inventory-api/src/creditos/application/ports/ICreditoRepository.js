'use strict'

/**
 * @interface ICreditoRepository
 * Port (contrato) para el repositorio de créditos.
 */
class ICreditoRepository {
  /** @param {string} clienteId @returns {Promise<number>} Saldo disponible (0 si no existe) */
  async findSaldoByClienteId(clienteId) { throw new Error('Not implemented') }

  /** @param {object} credito @returns {Promise<object>} */
  async save(credito) { throw new Error('Not implemented') }

  /**
   * Decrementa el saldo del cliente de forma atómica.
   * Lanza ConflictError si el saldo resultante sería negativo.
   * @param {string} clienteId
   * @param {number} monto
   * @returns {Promise<number>} Nuevo saldo
   */
  async decrementarSaldo(clienteId, monto) { throw new Error('Not implemented') }
}

module.exports = ICreditoRepository
