'use strict'

/**
 * Entidad de dominio: Ticket
 * Proyección de una Venta enriquecida con datos de la SesionDeCaja.
 * Es un objeto de solo lectura generado al completar una venta.
 */
class Ticket {
  constructor({ ventaId, sesionId, cajeroId, clienteId, items, subtotal, creditoAplicado, total, metodoPago, fechaVenta }) {
    this.ventaId = ventaId
    this.sesionId = sesionId
    this.cajeroId = cajeroId
    this.clienteId = clienteId
    this.items = items
    this.subtotal = subtotal
    this.creditoAplicado = creditoAplicado
    this.total = total
    this.metodoPago = metodoPago
    this.fechaVenta = fechaVenta
  }

  /**
   * Construye un Ticket a partir de una Venta y su SesionDeCaja.
   * @param {import('./Venta')} venta
   * @param {import('./SesionDeCaja')} sesion
   * @returns {Ticket}
   */
  static fromVenta(venta, sesion) {
    return new Ticket({
      ventaId: venta.id,
      sesionId: venta.sesionId,
      cajeroId: sesion.cajeroId,
      clienteId: venta.clienteId,
      items: venta.items.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      })),
      subtotal: venta.subtotal,
      creditoAplicado: venta.creditoAplicado,
      total: venta.total,
      metodoPago: venta.metodoPago,
      fechaVenta: venta.fechaVenta
    })
  }
}

module.exports = Ticket
