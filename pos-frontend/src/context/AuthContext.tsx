import {
  createContext,
  useContext,
  useState,
  useEffect,
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
    // Base64url → Base64 → JSON
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return {
      rol: payload.rol ?? null,
      nombre: payload.nombre ?? null,
    }
  } catch {
    return { rol: null, nombre: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [rol, setRol] = useState<Rol | null>(null)
  const [nombre, setNombre] = useState<string | null>(null)

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      const { rol: decodedRol, nombre: decodedNombre } = decodeJwtPayload(storedToken)
      setToken(storedToken)
      setRol((decodedRol as Rol) ?? null)
      setNombre(decodedNombre)
    }
  }, [])

  const login = useCallback((newToken: string, newRol: string, newNombre: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setRol(newRol as Rol)
    setNombre(newNombre)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setRol(null)
    setNombre(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, rol, nombre, login, logout }}>
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
