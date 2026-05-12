'use strict'

const UniqueId = require('../../shared/domain/value-objects/UniqueId')
const ValidationError = require('../../shared/domain/errors/ValidationError')

const METODOS_PAGO_VALIDOS = ['efectivo', 'tarjeta', 'credito']

/**
 * Entidad de dominio: Venta
 * Representa una transacción de venta registrada en el POS.
 */
class Venta {
  constructor({ id, sesionId, clienteId, items, subtotal, creditoAplicado, total, metodoPago, fechaVenta }) {
    this.id = id
    this.sesionId = sesionId
    this.clienteId = clienteId
    this.items = items
    this.subtotal = subtotal
    this.creditoAplicado = creditoAplicado
    this.total = total
    this.metodoPago = metodoPago
    this.fechaVenta = fechaVenta
  }

  /**
   * Crea una nueva Venta validando campos obligatorios.
   * @param {object} data
   * @returns {Venta}
   * @throws {ValidationError}
   */
  static create(data) {
    const { sesionId, clienteId, items, metodoPago } = data || {}

    if (!sesionId || typeof sesionId !== 'string' || sesionId.trim() === '') {
      throw new ValidationError('El campo sesionId es obligatorio')
    }
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
    if (!metodoPago || !METODOS_PAGO_VALIDOS.includes(metodoPago)) {
      throw new ValidationError(`El metodoPago debe ser uno de: ${METODOS_PAGO_VALIDOS.join(', ')}`)
    }

    return new Venta({
      id: UniqueId.generate(),
      sesionId: sesionId.trim(),
      clienteId: clienteId.trim(),
      items,
      subtotal: 0,
      creditoAplicado: 0,
      total: 0,
      metodoPago,
      fechaVenta: new Date().toISOString()
    })
  }
}

module.exports = Venta
