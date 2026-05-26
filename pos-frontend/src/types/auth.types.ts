export type Rol = 'CAJERO' | 'SUPERVISOR' | 'ADMIN'

export interface AuthUser {
  token: string
  rol: Rol
  nombre: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  rol: string
  nombre: string
}
