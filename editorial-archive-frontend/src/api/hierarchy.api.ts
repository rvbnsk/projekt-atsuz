import { apiClient } from './client'
import type { HierarchyNode, Breadcrumb } from '@/types/hierarchy.types'

export const hierarchyApi = {
  getTree: async (): Promise<HierarchyNode[]> => {
    const response = await apiClient.get<HierarchyNode[]>('/hierarchy')
    return response.data
  },

  getById: async (id: string): Promise<HierarchyNode> => {
    const response = await apiClient.get<HierarchyNode>(`/hierarchy/${id}`)
    return response.data
  },

  getBreadcrumbs: async (id: string): Promise<Breadcrumb[]> => {
    const response = await apiClient.get<Breadcrumb[]>(`/hierarchy/${id}/breadcrumbs`)
    return response.data
  },

  create: async (data: Partial<HierarchyNode>): Promise<HierarchyNode> => {
    const response = await apiClient.post<HierarchyNode>('/hierarchy', data)
    return response.data
  },

  update: async (id: string, data: Partial<HierarchyNode>): Promise<HierarchyNode> => {
    const response = await apiClient.put<HierarchyNode>(`/hierarchy/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/hierarchy/${id}`)
  },
}
