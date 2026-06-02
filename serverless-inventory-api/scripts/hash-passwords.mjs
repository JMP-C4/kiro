#!/usr/bin/env node
/** Genera hashes bcrypt para el seed de usuarios demo */
import bcrypt from 'bcryptjs'

const passwords = { admin: 'admin123', supervisor: 'super123', cajero: 'cajero123' }
for (const [user, pass] of Object.entries(passwords)) {
  const hash = await bcrypt.hash(pass, 10)
  console.log(`${user}: ${hash}`)
}
