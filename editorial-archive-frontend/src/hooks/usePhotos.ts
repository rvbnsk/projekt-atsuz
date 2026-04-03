import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { photosApi } from '@/api/photos.api'
import type { PhotoSearchParams } from '@/types/photo.types'

export const photoKeys = {
  all: ['photos'] as const,
  lists: () => [...photoKeys.all, 'list'] as const,
  list: (params: PhotoSearchParams) => [...photoKeys.lists(), params] as const,
  search: (params: PhotoSearchParams) => [...photoKeys.all, 'search', params] as const,
  detail: (id: string) => [...photoKeys.all, 'detail', id] as const,
  related: (id: string) => [...photoKeys.all, 'related', id] as const,
}

export function usePhotoList(params: PhotoSearchParams = {}) {
  return useQuery({
    queryKey: photoKeys.list(params),
    queryFn: () => photosApi.list(params),
  })
}

export function usePhotoSearch(params: PhotoSearchParams | null) {
  return useQuery({
    queryKey: photoKeys.search(params ?? {}),
    queryFn: () => photosApi.search(params!),
    enabled: params != null && Object.values(params).some((v) => v != null && v !== '' && v !== undefined),
  })
}

export function usePhotoSearchInfinite(params: Omit<PhotoSearchParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...photoKeys.all, 'infinite', params],
    queryFn: ({ pageParam = 0 }) =>
      photosApi.search({ ...params, page: pageParam as number, size: 24 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page + 1 < totalPages ? page + 1 : undefined
    },
  })
}

export function usePhoto(id: string) {
  return useQuery({
    queryKey: photoKeys.detail(id),
    queryFn: () => photosApi.getById(id),
    enabled: !!id,
  })
}

export function useRelatedPhotos(id: string) {
  return useQuery({
    queryKey: photoKeys.related(id),
    queryFn: () => photosApi.getRelated(id),
    enabled: !!id,
  })
}
