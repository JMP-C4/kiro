import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const endpoint = process.env.DYNAMODB_ENDPOINT
const region = process.env.AWS_REGION ?? 'us-east-1'

const clientConfig = {
  region,
  // Cuando hay endpoint local, forzar HTTP y credenciales ficticias
  ...(endpoint
    ? {
        endpoint,
        forcePathStyle: true,          // requerido para DynamoDB Local
        credentials: {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        },
        // Desactivar TLS para conexiones locales (http://)
        tls: !endpoint.startsWith('http://'),
      }
    : {}),
}

const client = new DynamoDBClient(clientConfig)

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

export const TABLE = {
  usuarios: process.env.USUARIOS_TABLE ?? 'pos-usuarios',
  productos: process.env.PRODUCTOS_TABLE ?? 'pos-productos',
  ventas: process.env.VENTAS_TABLE ?? 'pos-ventas',
  configuracion: process.env.CONFIGURACION_TABLE ?? 'pos-configuracion',
}
