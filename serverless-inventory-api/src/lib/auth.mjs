import { verifyToken } from './jwt.mjs'

export function getHeader(event, name) {
  const h = event.headers ?? {}
  const key = Object.keys(h).find((k) => k.toLowerCase() === name.toLowerCase())
  return key ? h[key] : undefined
}

/** @returns {{ sub: string, rol: string, nombre: string, iat: number, exp: number } | null} */
export function parseAuth(event) {
  const auth = getHeader(event, 'authorization')
  if (!auth || !String(auth).startsWith('Bearer ')) return null
  const token = String(auth).slice(7).trim()
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAuth(event) {
  const user = parseAuth(event)
  if (!user) {
    const err = new Error('No autenticado')
    err.statusCode = 401
    throw err
  }
  return user
}

export function requireRoles(event, allowed) {
  const user = requireAuth(event)
  if (!allowed.includes(user.rol)) {
    const err = new Error('Sin permiso')
    err.statusCode = 403
    throw err
  }
  return user
}
