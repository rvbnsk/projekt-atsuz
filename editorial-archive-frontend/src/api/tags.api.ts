import { apiClient } from './client'
import type { Tag } from '@/types/photo.types'

export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>('/tags')
    return response.data
  },

  suggest: async (q: string): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>('/tags/suggest', { params: { q } })
    return response.data
  },
}
