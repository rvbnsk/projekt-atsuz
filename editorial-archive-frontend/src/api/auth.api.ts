import { apiClient } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types'

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    )
    return response.data
  },

  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout', { refreshToken })
  },

  me: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}
