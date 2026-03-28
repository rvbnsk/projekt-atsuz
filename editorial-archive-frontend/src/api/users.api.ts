import { apiClient } from './client'
import type { UserResponse } from '@/types/admin.types'
import type { PagedResponse, SpringPage } from '@/types/api.types'
import { fromSpringPage } from '@/types/api.types'

export const usersApi = {
  list: async (params?: { page?: number; size?: number }): Promise<PagedResponse<UserResponse>> => {
    const response = await apiClient.get<SpringPage<UserResponse>>('/users', { params })
    return fromSpringPage(response.data)
  },

  block: async (id: string, blocked: boolean): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>(`/users/${id}/block`, { blocked })
    return response.data
  },

  changeRole: async (id: string, role: string): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>(`/users/${id}/role`, { role })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
