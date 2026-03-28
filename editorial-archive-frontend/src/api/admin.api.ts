import { apiClient } from './client'
import type { StatsDto, AuditLog } from '@/types/admin.types'
import type { PagedResponse, SpringPage } from '@/types/api.types'
import { fromSpringPage } from '@/types/api.types'

export const adminApi = {
  getStats: async (): Promise<StatsDto> => {
    const response = await apiClient.get<StatsDto>('/admin/stats')
    return response.data
  },

  getAuditLog: async (params?: {
    actorId?: string
    action?: string
    from?: string
    to?: string
    page?: number
    size?: number
  }): Promise<PagedResponse<AuditLog>> => {
    const response = await apiClient.get<SpringPage<AuditLog>>('/admin/audit', { params })
    return fromSpringPage(response.data)
  },
}
