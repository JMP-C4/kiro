'use strict'

/**
 * Entidad de dominio: Credito
 * Representa el saldo a favor acumulado de un cliente.
 * Un registro por cliente (clienteId es la clave).
 */
class Credito {
  constructor({ clienteId, saldo, historial }) {
    this.clienteId = clienteId
    this.saldo = saldo
    this.historial = historial || []
  }

  /**
   * Calcula el monto de crédito a aplicar sin dejar saldo negativo.
   * Retorna el mínimo entre el saldo disponible y el monto solicitado.
   *
   * @param {number} monto - Monto a aplicar
   * @returns {number} Monto efectivamente aplicable (>= 0)
   *
   * @example
   * const credito = new Credito({ clienteId: '1', saldo: 50, historial: [] })
   * credito.aplicarCredito(30) // → 30 (saldo queda en 20)
   * credito.aplicarCredito(80) // → 50 (saldo queda en 0, no negativo)
   */
  aplicarCredito(monto) {
    if (monto <= 0) return 0
    return Math.min(this.saldo, monto)
  }
}

module.exports = Credito
