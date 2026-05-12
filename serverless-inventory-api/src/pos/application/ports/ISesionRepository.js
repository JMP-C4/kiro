'use strict'

/**
 * @interface ISesionRepository
 * Port (contrato) para el repositorio de sesiones de caja.
 */
class ISesionRepository {
  /** @param {string} id @returns {Promise<import('../../domain/SesionDeCaja')|null>} */
  async findById(id) { throw new Error('Not implemented') }

  /** @param {string} cajeroId @returns {Promise<import('../../domain/SesionDeCaja')|null>} */
  async findAbiertaByCajeroId(cajeroId) { throw new Error('Not implemented') }

  /** @param {import('../../domain/SesionDeCaja')} sesion @returns {Promise<import('../../domain/SesionDeCaja')>} */
  async save(sesion) { throw new Error('Not implemented') }

  /** @param {string} id @param {object} data @returns {Promise<import('../../domain/SesionDeCaja')>} */
  async update(id, data) { throw new Error('Not implemented') }
}

module.exports = ISesionRepository
