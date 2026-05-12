'use strict'

/**
 * @interface IVentaRepository
 * Port (contrato) para el repositorio de ventas POS.
 */
class IVentaRepository {
  /** @param {string} id @returns {Promise<import('../../domain/Venta')|null>} */
  async findById(id) { throw new Error('Not implemented') }

  /** @param {string} sesionId @returns {Promise<import('../../domain/Venta')[]>} Ordenadas por fechaVenta asc */
  async findBySesionId(sesionId) { throw new Error('Not implemented') }

  /** @param {import('../../domain/Venta')} venta @returns {Promise<import('../../domain/Venta')>} */
  async save(venta) { throw new Error('Not implemented') }
}

module.exports = IVentaRepository
