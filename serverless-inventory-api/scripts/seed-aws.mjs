#!/usr/bin/env node
/**
 * Carga los datos iniciales en DynamoDB de AWS (producción/staging).
 *
 * Uso:
 *   AWS_REGION=us-east-1 STAGE=prod node scripts/seed-aws.mjs
 *
 * Requiere credenciales AWS configuradas:
 *   aws configure  o  variables de entorno AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
 *
 * ADVERTENCIA: Este script hace hash de contraseñas nuevas.
 * Los usuarios del seed son solo para el primer despliegue.
 * Cambia las contraseñas después del primer login.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const STAGE = process.env.STAGE ?? 'dev'
const REGION = process.env.AWS_REGION ?? 'us-east-1'

const TABLES = {
  usuarios:      `pos-usuarios-${STAGE}`,
  productos:     `pos-productos-${STAGE}`,
  configuracion: `pos-configuracion-${STAGE}`,
}

const client = new DynamoDBClient({ region: REGION })
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

// ── Confirmación interactiva ──────────────────────────────────────────────────

async function confirm(msg) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(`${msg} [s/N] `, (ans) => {
      rl.close()
      resolve(ans.trim().toLowerCase() === 's')
    })
  })
}

// ── Usuarios iniciales ────────────────────────────────────────────────────────

const USUARIOS_INICIALES = [
  { username: 'admin',      nombre: 'Administrador', apellido: 'Sistema',   rol: 'ADMIN',      password: 'Admin2024!' },
  { username: 'supervisor', nombre: 'Supervisor',    apellido: 'Demo',      rol: 'SUPERVISOR', password: 'Super2024!' },
  { username: 'cajero',     nombre: 'Cajero',        apellido: 'Demo',      rol: 'CAJERO',     password: 'Cajero2024!' },
]

async function seedUsuarios() {
  console.log('\n👤 Usuarios:')
  for (const u of USUARIOS_INICIALES) {
    // Verificar si ya existe
    const existing = await doc.send(new GetCommand({
      TableName: TABLES.usuarios,
      Key: { username: u.username },
    }))
    if (existing.Item) {
      console.log(`  ⊘ ${u.username} — ya existe, omitido`)
      continue
    }
    const password_hash = await bcrypt.hash(u.password, 12) // costo 12 para producción
    await doc.send(new PutCommand({
      TableName: TABLES.usuarios,
      Item: {
        username: u.username,
        id: `usr-${u.username}`,
        nombre: u.nombre,
        apellido: u.apellido,
        password_hash,
        rol: u.rol,
        activo: true,
        created_at: new Date().toISOString(),
      },
    }))
    console.log(`  ✓ ${u.username} (${u.rol}) — contraseña: ${u.password}`)
  }
}

async function seedProductos() {
  const seedPath = join(__dirname, '../../db/dynamodb/seed/productos.json')
  const productos = JSON.parse(readFileSync(seedPath, 'utf8'))
  console.log('\n📦 Productos:')
  for (const p of productos) {
    const existing = await doc.send(new GetCommand({
      TableName: TABLES.productos,
      Key: { id: p.id },
    }))
    if (existing.Item) {
      console.log(`  ⊘ ${p.nombre} — ya existe, omitido`)
      continue
    }
    await doc.send(new PutCommand({ TableName: TABLES.productos, Item: p }))
    console.log(`  ✓ ${p.nombre} (${p.codigo})`)
  }
}

async function seedConfiguracion() {
  console.log('\n⚙️  Configuración:')
  const existing = await doc.send(new GetCommand({
    TableName: TABLES.configuracion,
    Key: { id: 'global' },
  }))
  if (existing.Item) {
    console.log('  ⊘ Configuración ya existe, omitida')
    return
  }
  await doc.send(new PutCommand({
    TableName: TABLES.configuracion,
    Item: {
      id: 'global',
      nombre_negocio: 'Mi Supermercado',
      tasa_iva: 0.19,
      formato_papel: '80mm',
      logo_url: null,
      updated_at: new Date().toISOString(),
    },
  }))
  console.log('  ✓ Configuración inicial creada')
}

async function main() {
  console.log(`\n🚀 Seed DynamoDB AWS`)
  console.log(`   Región: ${REGION}`)
  console.log(`   Stage:  ${STAGE}`)
  console.log(`   Tablas: ${Object.values(TABLES).join(', ')}`)

  const ok = await confirm('\n¿Continuar con el seed?')
  if (!ok) { console.log('Cancelado.'); process.exit(0) }

  await seedUsuarios()
  await seedProductos()
  await seedConfiguracion()

  console.log('\n✅ Seed completado.')
  console.log('\n⚠️  IMPORTANTE: Cambia las contraseñas de los usuarios después del primer login.\n')
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})
