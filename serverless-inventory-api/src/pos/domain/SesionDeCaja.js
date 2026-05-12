'use strict'

const UniqueId = require('../../shared/domain/value-objects/UniqueId')
const ValidationError = require('../../shared/domain/errors/ValidationError')
const ConflictError = require('../../shared/domain/errors/ConflictError')

/**
 * Entidad de dominio: SesionDeCaja
 * Representa un período de operación de una caja registradora.
 */
class SesionDeCaja {
  constructor({ id, cajeroId, estado, montoInicial, montoFinal, fechaApertura, fechaCierre }) {
    this.id = id
    this.cajeroId = cajeroId
    this.estado = estado
    this.montoInicial = montoInicial
    this.montoFinal = montoFinal
    this.fechaApertura = fechaApertura
    this.fechaCierre = fechaCierre
  }

  /**
   * Crea una nueva sesión de caja en estado "abierta".
   * @param {object} data
   * @returns {SesionDeCaja}
   * @throws {ValidationError}
   */
  static create(data) {
    const { cajeroId, montoInicial } = data || {}

    if (!cajeroId || typeof cajeroId !== 'string' || cajeroId.trim() === '') {
      throw new ValidationError('El campo cajeroId es obligatorio')
    }
    if (montoInicial === undefined || montoInicial === null || typeof montoInicial !== 'number' || montoInicial < 0) {
      throw new ValidationError('El montoInicial debe ser un número mayor o igual a 0')
    }

    return new SesionDeCaja({
      id: UniqueId.generate(),
      cajeroId: cajeroId.trim(),
      estado: 'abierta',
      montoInicial,
      montoFinal: null,
      fechaApertura: new Date().toISOString(),
      fechaCierre: null
    })
  }

  /**
   * Cierra la sesión de caja registrando el monto final.
   * @param {number} montoFinal
   * @throws {ConflictError} Si la sesión ya está cerrada
   * @throws {ValidationError} Si montoFinal es inválido
   */
  cerrar(montoFinal) {
    if (this.estado === 'cerrada') {
      throw new ConflictError('La sesión de caja ya está cerrada')
    }
    if (montoFinal === undefined || montoFinal === null || typeof montoFinal !== 'number' || montoFinal < 0) {
      throw new ValidationError('El montoFinal debe ser un número mayor o igual a 0')
    }

    this.estado = 'cerrada'
    this.montoFinal = montoFinal
    this.fechaCierre = new Date().toISOString()
  }
}

module.exports = SesionDeCaja
