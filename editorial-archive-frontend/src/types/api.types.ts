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

/** Spring Data Page<T> JSON format returned by backend */
export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number  // current page (0-indexed)
  size: number
}

export function fromSpringPage<T>(page: SpringPage<T>): PagedResponse<T> {
  return {
    data: page.content,
    pagination: {
      page: page.number,
      size: page.size,
      totalElements: page.totalElements,
      totalPages: page.totalPages,
    },
    timestamp: new Date().toISOString(),
  }
}
