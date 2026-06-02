import apiClient from './client'
import type { LoginRequest, LoginResponse } from '../types/auth.types'

export async function loginApi(
  username: string,
  password: string
): Promise<{ token: string; rol: string; nombre: string }> {
  const payload: LoginRequest = { username, password }
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}
