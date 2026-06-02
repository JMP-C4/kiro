#!/usr/bin/env node
/**
 * Carga los JSON de db/dynamodb/seed/ en DynamoDB (local o AWS).
 *
 * Uso:
 *   npm run seed:local   # DynamoDB Local en :8000
 *   npm run seed         # tablas en AWS (credenciales configuradas)
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED_DIR = join(__dirname, '../../db/dynamodb/seed')

const TABLES = {
  usuarios: 'pos-usuarios',
  productos: 'pos-productos',
  configuracion: 'pos-configuracion',
  ventas: 'pos-ventas',
}

const endpoint = process.env.DYNAMODB_ENDPOINT
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  ...(endpoint
    ? {
        endpoint,
        credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
      }
    : {}),
})

const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

function loadJson(name) {
  const raw = readFileSync(join(SEED_DIR, `${name}.json`), 'utf8')
  return JSON.parse(raw)
}

async function putItems(tableName, items, keyFn) {
  if (!items.length) {
    console.log(`  ⊘ ${tableName} — sin registros`)
    return
  }
  for (const item of items) {
    await doc.send(new PutCommand({ TableName: tableName, Item: item }))
    console.log(`  ✓ ${tableName} ← ${keyFn(item)}`)
  }
}

async function main() {
  console.log(`\nSeed DynamoDB${endpoint ? ` (${endpoint})` : ' (AWS)'}\n`)

  const usuarios = loadJson('usuarios')
  const productos = loadJson('productos')
  const configuracion = loadJson('configuracion')
  const ventas = loadJson('ventas')

  await putItems(TABLES.usuarios, usuarios, (i) => i.username)
  await putItems(TABLES.productos, productos, (i) => i.codigo)
  await putItems(TABLES.configuracion, configuracion, (i) => i.id)
  await putItems(TABLES.ventas, ventas, (i) => i.id ?? '(vacío)')

  console.log('\nListo.\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
