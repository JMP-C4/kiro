import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Rol } from '../types/auth.types'

const TOKEN_KEY = 'token'

interface AuthContextValue {
  token: string | null
  rol: Rol | null
  nombre: string | null
  login: (token: string, rol: string, nombre: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Decode the `rol` and `nombre` fields from a JWT payload.
 * The backend embeds these as custom claims in the token.
 * Returns null values if the token is malformed or missing claims.
 */
function decodeJwtPayload(token: string): { rol: string | null; nombre: string | null } {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { rol: null, nombre: null }
    // Base64url → Base64 → JSON (with padding for atob)
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    if (pad) base64 += '='.repeat(4 - pad)
    const payload = JSON.parse(atob(base64))
    return {
      rol: payload.rol ?? null,
      nombre: payload.nombre ?? null,
    }
  } catch {
    return { rol: null, nombre: null }
  }
}

function readStoredSession(): { token: string | null; rol: Rol | null; nombre: string | null } {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  if (!storedToken) return { token: null, rol: null, nombre: null }
  const { rol: decodedRol, nombre: decodedNombre } = decodeJwtPayload(storedToken)
  return {
    token: storedToken,
    rol: (decodedRol as Rol) ?? null,
    nombre: decodedNombre,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(readStoredSession)

  const login = useCallback((newToken: string, newRol: string, newNombre: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setSession({ token: newToken, rol: newRol as Rol, nombre: newNombre })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setSession({ token: null, rol: null, nombre: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
