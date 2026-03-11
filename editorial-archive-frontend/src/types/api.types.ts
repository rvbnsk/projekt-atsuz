// API and common types

export interface PaginationMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PagedResponse<T> {
  data: T[]
  pagination: PaginationMeta
  timestamp: string
}

export interface ApiError {
  error: {
    code: string
    message: string
    timestamp: string
    path: string
  }
}

export type SortDirection = 'asc' | 'desc'

export interface PageParams {
  page?: number
  size?: number
  sort?: string
  direction?: SortDirection
}
