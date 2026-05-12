'use strict'

/**
 * @interface ICobroRepository
 * Port (contrato) para el repositorio de cobros.
 */
class ICobroRepository {
  /** @param {string} id @returns {Promise<import('../../domain/Cobro')|null>} */
  async findById(id) { throw new Error('Not implemented') }

  /** @param {string} clienteId @returns {Promise<import('../../domain/Cobro')[]>} */
  async findByClienteId(clienteId) { throw new Error('Not implemented') }

  /** @param {import('../../domain/Cobro')} cobro @returns {Promise<import('../../domain/Cobro')>} */
  async save(cobro) { throw new Error('Not implemented') }
}

module.exports = ICobroRepository
