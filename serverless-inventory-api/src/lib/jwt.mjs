import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me-in-production-32chars'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h'

export function signToken({ username, rol, nombre }) {
  return jwt.sign({ sub: username, rol, nombre }, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}
