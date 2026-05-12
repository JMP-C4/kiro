'use strict'

/**
 * @interface IProductoRepository
 * Port (contrato) para el repositorio de productos.
 * Las implementaciones concretas (adapters) deben cumplir esta interfaz.
 */
class IProductoRepository {
  /** @param {{ categoria?: string }} [filters] @returns {Promise<import('../../domain/Producto')[]>} */
  async findAll(filters) { throw new Error('Not implemented') }

  /** @param {string} id @returns {Promise<import('../../domain/Producto')|null>} */
  async findById(id) { throw new Error('Not implemented') }

  /** @param {import('../../domain/Producto')} producto @returns {Promise<import('../../domain/Producto')>} */
  async save(producto) { throw new Error('Not implemented') }

  /** @param {string} id @param {object} data @returns {Promise<import('../../domain/Producto')>} */
  async update(id, data) { throw new Error('Not implemented') }

  /** @param {string} id @returns {Promise<void>} */
  async softDelete(id) { throw new Error('Not implemented') }
}

module.exports = IProductoRepository
