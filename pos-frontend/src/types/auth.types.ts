export interface LoginCredentials {
  usuario: string
  contrasena: string
}

export interface AuthResponse {
  access_token: string
  token_type?: string
}

export interface AuthUser {
  token: string
}

export interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}
