'use strict'

const UniqueId = require('../../shared/domain/value-objects/UniqueId')
const ValidationError = require('../../shared/domain/errors/ValidationError')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Entidad de dominio: Cliente
 * Representa un comprador registrado en el sistema.
 */
class Cliente {
  constructor({ id, nombre, email, telefono, activo, fechaCreacion }) {
    this.id = id
    this.nombre = nombre
    this.email = email
    this.telefono = telefono
    this.activo = activo
    this.fechaCreacion = fechaCreacion
  }

  /**
   * Crea un nuevo Cliente validando todos los campos obligatorios.
   * @param {object} data - Datos del cliente
   * @returns {Cliente}
   * @throws {ValidationError} Si algún campo es inválido
   */
  static create(data) {
    const { nombre, email, telefono } = data || {}

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new ValidationError('El campo nombre es obligatorio')
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new ValidationError('El campo email es obligatorio')
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      throw new ValidationError('Formato de email inválido')
    }
    if (!telefono || typeof telefono !== 'string' || telefono.trim() === '') {
      throw new ValidationError('El campo telefono es obligatorio')
    }

    return new Cliente({
      id: UniqueId.generate(),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      activo: true,
      fechaCreacion: new Date().toISOString()
    })
  }
}

module.exports = Cliente
