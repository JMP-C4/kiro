import type { Rol } from './auth.types'

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  username: string
  rol: Rol
  activo: boolean
}

export interface UsuarioRequest {
  nombre: string
  apellido: string
  username: string
  password?: string  // optional on update
  rol: Rol
  activo: boolean
}
