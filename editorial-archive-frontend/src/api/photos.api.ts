import { apiClient } from './client'
import type { Photo, PhotoSearchParams, PhotoUploadRequest } from '@/types/photo.types'
import type { PagedResponse, SpringPage } from '@/types/api.types'
import { fromSpringPage } from '@/types/api.types'

export const photosApi = {
  list: async (params?: PhotoSearchParams): Promise<PagedResponse<Photo>> => {
    const response = await apiClient.get<SpringPage<Photo>>('/photos', { params })
    return fromSpringPage(response.data)
  },

  search: async (params: PhotoSearchParams): Promise<PagedResponse<Photo>> => {
    const response = await apiClient.get<SpringPage<Photo>>('/photos/search', { params })
    return fromSpringPage(response.data)
  },

  getById: async (id: string): Promise<Photo> => {
    const response = await apiClient.get<Photo>(`/photos/${id}`)
    return response.data
  },

  getRelated: async (id: string): Promise<Photo[]> => {
    const response = await apiClient.get<Photo[]>(`/photos/${id}/related`)
    return response.data
  },

  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(`/photos/${id}/view`)
  },

  upload: async (file: File, metadata: PhotoUploadRequest): Promise<Photo> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    )

    const response = await apiClient.post<Photo>('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  update: async (id: string, metadata: Partial<PhotoUploadRequest>): Promise<Photo> => {
    const response = await apiClient.put<Photo>(`/photos/${id}`, metadata)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/photos/${id}`)
  },

  myPhotos: async (params?: { page?: number; size?: number }): Promise<PagedResponse<Photo>> => {
    const response = await apiClient.get<SpringPage<Photo>>('/photos/my', { params })
    return fromSpringPage(response.data)
  },

  // Admin
  getPending: async (params?: { page?: number; size?: number }): Promise<PagedResponse<Photo>> => {
    const response = await apiClient.get<SpringPage<Photo>>('/photos/pending', { params })
    return fromSpringPage(response.data)
  },

  updateStatus: async (
    id: string,
    status: string,
    rejectionReason?: string,
  ): Promise<Photo> => {
    const response = await apiClient.patch<Photo>(`/photos/${id}/status`, {
      status,
      rejectionReason,
    })
    return response.data
  },
}
