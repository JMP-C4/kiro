import apiClient from './client'
import type { AuthResponse, LoginCredentials } from '../types/auth.types'

export const authApi = {
  /**
   * Autentica al usuario y retorna el access_token JWT.
   * Endpoint: POST /auth
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth', credentials)
    return response.data
  },
}
