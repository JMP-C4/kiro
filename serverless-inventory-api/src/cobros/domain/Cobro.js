'use strict'

const UniqueId = require('../../shared/domain/value-objects/UniqueId')
const ValidationError = require('../../shared/domain/errors/ValidationError')

/**
 * Entidad de dominio: Cobro
 * Representa una transacción de pago asociada a un cliente y productos.
 */
class Cobro {
  constructor({ id, clienteId, items, subtotal, creditoAplicado, total, aplicarCredito, fechaCobro }) {
    this.id = id
    this.clienteId = clienteId
    this.items = items
    this.subtotal = subtotal
    this.creditoAplicado = creditoAplicado
    this.total = total
    this.aplicarCredito = aplicarCredito
    this.fechaCobro = fechaCobro
  }

  /**
   * Crea un nuevo Cobro validando campos obligatorios.
   * El cálculo de totales se realiza en el use case (requiere precios del repositorio).
   * @param {object} data
   * @returns {Cobro}
   * @throws {ValidationError}
   */
  static create(data) {
    const { clienteId, items, aplicarCredito = false } = data || {}

    if (!clienteId || typeof clienteId !== 'string' || clienteId.trim() === '') {
      throw new ValidationError('El campo clienteId es obligatorio')
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('El campo items debe ser un arreglo no vacío')
    }

    for (const item of items) {
      if (!item.productoId || typeof item.productoId !== 'string') {
        throw new ValidationError('Cada item debe tener un productoId válido')
      }
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        throw new ValidationError('La cantidad de cada item debe ser un entero mayor a 0')
      }
    }

    return new Cobro({
      id: UniqueId.generate(),
      clienteId: clienteId.trim(),
      items,
      subtotal: 0,
      creditoAplicado: 0,
      total: 0,
      aplicarCredito,
      fechaCobro: new Date().toISOString()
    })
  }
}

module.exports = Cobro
