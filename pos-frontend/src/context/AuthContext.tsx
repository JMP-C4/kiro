import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api/auth.api'
import type { AuthContextType, AuthUser, LoginCredentials } from '../types/auth.types'

const AuthContext = createContext<AuthContextType | null>(null)

// Credenciales de demo para desarrollo sin backend
const DEV_CREDENTIALS = { usuario: 'admin', contrasena: 'admin123' }
const DEV_TOKEN = 'dev-token-local'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaurar sesión desde localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setUser({ token })
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    // Modo demo: si el backend no responde, usar credenciales locales
    const isDevLogin =
      credentials.usuario === DEV_CREDENTIALS.usuario &&
      credentials.contrasena === DEV_CREDENTIALS.contrasena

    try {
      const data = await authApi.login(credentials)
      localStorage.setItem('access_token', data.access_token)
      setUser({ token: data.access_token })
    } catch (error) {
      // Si el backend no está disponible y son credenciales demo, permitir acceso
      if (isDevLogin) {
        localStorage.setItem('access_token', DEV_TOKEN)
        setUser({ token: DEV_TOKEN })
        return
      }
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
