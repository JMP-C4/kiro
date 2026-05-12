'use strict'

/**
 * @interface IClienteRepository
 * Port (contrato) para el repositorio de clientes.
 */
class IClienteRepository {
  /** @returns {Promise<import('../../domain/Cliente')[]>} */
  async findAll() { throw new Error('Not implemented') }

  /** @param {string} id @returns {Promise<import('../../domain/Cliente')|null>} */
  async findById(id) { throw new Error('Not implemented') }

  /** @param {string} email @returns {Promise<import('../../domain/Cliente')|null>} */
  async findByEmail(email) { throw new Error('Not implemented') }

  /** @param {import('../../domain/Cliente')} cliente @returns {Promise<import('../../domain/Cliente')>} */
  async save(cliente) { throw new Error('Not implemented') }

  /** @param {string} id @param {object} data @returns {Promise<import('../../domain/Cliente')>} */
  async update(id, data) { throw new Error('Not implemented') }

  /** @param {string} id @returns {Promise<void>} */
  async softDelete(id) { throw new Error('Not implemented') }
}

module.exports = IClienteRepository
