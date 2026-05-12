'use strict'

const UniqueId = require('../../shared/domain/value-objects/UniqueId')
const ValidationError = require('../../shared/domain/errors/ValidationError')

/**
 * Entidad de dominio: Producto
 * Representa un artículo del inventario con nombre, categoría, precio y stock.
 */
class Producto {
  constructor({ id, nombre, categoria, precio, stock, activo, fechaCreacion }) {
    this.id = id
    this.nombre = nombre
    this.categoria = categoria
    this.precio = precio
    this.stock = stock
    this.activo = activo
    this.fechaCreacion = fechaCreacion
  }

  /**
   * Crea un nuevo Producto validando todos los campos obligatorios.
   * @param {object} data - Datos del producto
   * @returns {Producto}
   * @throws {ValidationError} Si algún campo es inválido
   */
  static create(data) {
    const { nombre, categoria, precio, stock } = data || {}

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new ValidationError('El campo nombre es obligatorio')
    }
    if (!categoria || typeof categoria !== 'string' || categoria.trim() === '') {
      throw new ValidationError('El campo categoria es obligatorio')
    }
    if (precio === undefined || precio === null) {
      throw new ValidationError('El campo precio es obligatorio')
    }
    if (typeof precio !== 'number' || precio <= 0) {
      throw new ValidationError('El precio debe ser mayor a 0')
    }
    if (stock === undefined || stock === null) {
      throw new ValidationError('El campo stock es obligatorio')
    }
    if (!Number.isInteger(stock) || stock < 0) {
      throw new ValidationError('El stock no puede ser negativo')
    }

    return new Producto({
      id: UniqueId.generate(),
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      precio,
      stock,
      activo: true,
      fechaCreacion: new Date().toISOString()
    })
  }
}

module.exports = Producto
