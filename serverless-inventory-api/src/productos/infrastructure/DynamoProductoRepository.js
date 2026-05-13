'use strict'

const { GetCommand, PutCommand, UpdateCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { getDynamoDBClient } = require('../../shared/infrastructure/DynamoDBClient')
const IProductoRepository = require('../application/ports/IProductoRepository')
const NotFoundError = require('../../shared/domain/errors/NotFoundError')

const TABLE_NAME = process.env.PRODUCTOS_TABLE || 'Productos'

/**
 * Adapter DynamoDB para el repositorio de productos.
 * Implementa IProductoRepository usando AWS DynamoDB Document Client.
 */
class DynamoProductoRepository extends IProductoRepository {
  constructor() {
    super()
    this.client = getDynamoDBClient()
  }

  /**
   * Lista todos los productos activos.
   * Si se provee `categoria`, usa el GSI `categoria-index` para filtrar.
   *
   * @param {{ categoria?: string }} [filters]
   * @returns {Promise<object[]>}
   */
  async findAll(filters = {}) {
    const { categoria } = filters

    if (categoria) {
      // Usar GSI categoria-index para filtrado eficiente
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'categoria-index',
        KeyConditionExpression: 'categoria = :cat',
        FilterExpression: 'activo = :activo',
        ExpressionAttributeValues: {
          ':cat': categoria,
          ':activo': true,
        },
      })
      const result = await this.client.send(command)
      return result.Items || []
    }

    // Sin filtro: scan completo con filtro de activos
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'activo = :activo',
      ExpressionAttributeValues: {
        ':activo': true,
      },
    })
    const result = await this.client.send(command)
    return result.Items || []
  }

  /**
   * Busca un producto por su ID.
   * Retorna null si no existe o está eliminado lógicamente.
   *
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
    const result = await this.client.send(command)

    if (!result.Item || result.Item.activo === false) {
      return null
    }
    return result.Item
  }

  /**
   * Persiste un nuevo producto en DynamoDB.
   *
   * @param {object} producto - Entidad Producto
   * @returns {Promise<object>}
   */
  async save(producto) {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
        stock: producto.stock,
        activo: producto.activo,
        fechaCreacion: producto.fechaCreacion,
      },
    })
    await this.client.send(command)
    return producto
  }

  /**
   * Actualiza campos específicos de un producto existente.
   * Solo actualiza los campos presentes en `data`, preservando el resto.
   *
   * @param {string} id
   * @param {Partial<object>} data - Campos a actualizar
   * @returns {Promise<object>}
   * @throws {NotFoundError} Si el producto no existe
   */
  async update(id, data) {
    const existing = await this.findById(id)
    if (!existing) {
      throw new NotFoundError('Producto')
    }

    // Construir expresión de actualización dinámica
    const updateExpressions = []
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}

    const allowedFields = ['nombre', 'categoria', 'precio', 'stock']
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`)
        expressionAttributeNames[`#${field}`] = field
        expressionAttributeValues[`:${field}`] = data[field]
      }
    }

    if (updateExpressions.length === 0) {
      return existing
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })

    const result = await this.client.send(command)
    return result.Attributes
  }

  /**
   * Eliminación lógica: establece `activo = false`.
   * El registro físico se preserva en DynamoDB.
   *
   * @param {string} id
   * @returns {Promise<void>}
   * @throws {NotFoundError} Si el producto no existe
   */
  async softDelete(id) {
    const existing = await this.findById(id)
    if (!existing) {
      throw new NotFoundError('Producto')
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET activo = :activo',
      ExpressionAttributeValues: {
        ':activo': false,
      },
    })
    await this.client.send(command)
  }
}

module.exports = DynamoProductoRepository
