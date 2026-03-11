import { apiClient } from './client'
import type { Photo, PhotoSearchParams, PhotoUploadRequest } from '@/types/photo.types'
import type { PagedResponse } from '@/types/api.types'

export const photosApi = {
  list: async (params?: PhotoSearchParams): Promise<PagedResponse<Photo>> => {
    const response = await apiClient.get<PagedResponse<Photo>>('/photos', { params })
    return response.data
  },

  search: async (params: PhotoSearchParams): Promise<PagedResponse<Photo>> => {
    const response = await apiClient.get<PagedResponse<Photo>>('/photos/search', { params })
    return response.data
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
    formData.append('title', metadata.title)
    if (metadata.description) formData.append('description', metadata.description)
    if (metadata.nodeId) formData.append('nodeId', metadata.nodeId)
    if (metadata.tags) metadata.tags.forEach((t) => formData.append('tags', t))
    if (metadata.photoDateFrom) formData.append('photoDateFrom', metadata.photoDateFrom)
    if (metadata.photoDateTo) formData.append('photoDateTo', metadata.photoDateTo)
    if (metadata.photoDateLabel) formData.append('photoDateLabel', metadata.photoDateLabel)
    if (metadata.locationName) formData.append('locationName', metadata.locationName)
    if (metadata.latitude != null) formData.append('latitude', String(metadata.latitude))
    if (metadata.longitude != null) formData.append('longitude', String(metadata.longitude))
    if (metadata.rightsStatement) formData.append('rightsStatement', metadata.rightsStatement)

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
    const response = await apiClient.get<PagedResponse<Photo>>('/photos/my', { params })
    return response.data
  },

  // Admin
  getPending: async (params?: { page?: number; size?: number }): Promise<PagedResponse<Photo>> => {
    const response = await apiClient.get<PagedResponse<Photo>>('/photos/pending', { params })
    return response.data
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
