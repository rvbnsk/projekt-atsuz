export interface StatsDto {
  totalPhotos: number
  approvedPhotos: number
  pendingPhotos: number
  rejectedPhotos: number
  totalUsers: number
  totalTags: number
  totalHierarchyNodes: number
}

export interface AuditLog {
  id: string
  actorId: string | null
  action: string
  targetType: string | null
  targetId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

export interface UserResponse {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: 'VIEWER' | 'CREATOR' | 'ADMIN'
  provider: string
  isBlocked: boolean
  createdAt: string
}
