'use strict'

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

/**
 * Singleton del cliente DynamoDB con Document Client.
 * Reutiliza la misma instancia entre invocaciones Lambda (warm start).
 */
let instance = null

/**
 * Retorna la instancia singleton de DynamoDBDocumentClient.
 * @returns {DynamoDBDocumentClient}
 */
function getDynamoDBClient() {
  if (!instance) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1'
    })

    instance = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        // Convierte undefined a null en lugar de omitir el campo
        convertEmptyValues: false,
        // Elimina atributos undefined del objeto
        removeUndefinedValues: true
      },
      unmarshallOptions: {
        // Convierte números DynamoDB a JS number
        wrapNumbers: false
      }
    })
  }

  return instance
}

module.exports = { getDynamoDBClient }
