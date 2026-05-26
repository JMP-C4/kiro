import apiClient from './client'
import type { LoginRequest, LoginResponse } from '../types/auth.types'

// ---------------------------------------------------------------------------
// Mock users — acceso libre mientras el backend no está disponible
// Quitar este bloque y descomentar la llamada real cuando el backend esté listo
// ---------------------------------------------------------------------------
const MOCK_USERS: Record<string, { password: string; rol: string; nombre: string }> = {
  admin:      { password: 'admin123',  rol: 'ADMIN',      nombre: 'Administrador' },
  supervisor: { password: 'super123',  rol: 'SUPERVISOR',  nombre: 'Supervisor Demo' },
  cajero:     { password: 'cajero123', rol: 'CAJERO',      nombre: 'Cajero Demo' },
}

function makeFakeJwt(username: string, rol: string, nombre: string): string {
  // JWT structure: header.payload.signature (signature is fake — solo para desarrollo)
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    sub: username,
    rol,
    nombre,
    exp: Math.floor(Date.now() / 1000) + 8 * 3600,
  }))
  return `${header}.${payload}.mock-signature`
}

export async function loginApi(
  username: string,
  password: string
): Promise<{ token: string; rol: string; nombre: string }> {
  // ── MOCK MODE ──────────────────────────────────────────────────────────
  // Simula el backend localmente. Eliminar cuando el backend esté corriendo.
  const user = MOCK_USERS[username.toLowerCase()]
  if (user && user.password === password) {
    await new Promise((r) => setTimeout(r, 400)) // simula latencia
    const token = makeFakeJwt(username, user.rol, user.nombre)
    return { token, rol: user.rol, nombre: user.nombre }
  }
  if (user && user.password !== password) {
    // Simula 401
    const err = Object.assign(new Error('Unauthorized'), { response: { status: 401 } })
    throw err
  }
  // Usuario no existe → 401
  const err = Object.assign(new Error('Unauthorized'), { response: { status: 401 } })
  throw err
  // ── FIN MOCK MODE ──────────────────────────────────────────────────────

  // ── LLAMADA REAL (descomentar cuando el backend esté listo) ────────────
  // const payload: LoginRequest = { username, password }
  // const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  // return response.data
}

// Silencia el warning de imports no usados en mock mode
void (apiClient as unknown)
void (({} as LoginRequest) satisfies LoginRequest)
void (({} as LoginResponse) satisfies LoginResponse)
