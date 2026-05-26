import apiClient from './client'
import type { Usuario, UsuarioRequest } from '../types/usuario.types'

export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await apiClient.get<Usuario[]>('/usuarios')
  return response.data
}

export async function crearUsuario(data: UsuarioRequest): Promise<Usuario> {
  const response = await apiClient.post<Usuario>('/usuarios', data)
  return response.data
}

export async function actualizarUsuario(id: number, data: Partial<UsuarioRequest>): Promise<Usuario> {
  const response = await apiClient.put<Usuario>(`/usuarios/${id}`, data)
  return response.data
}

export async function desactivarUsuario(id: number): Promise<void> {
  await apiClient.delete(`/usuarios/${id}`)
}
