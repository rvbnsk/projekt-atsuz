export type UserRole = 'VIEWER' | 'CREATOR' | 'ADMIN'

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: UserRole
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

export interface LoginRequest {
  email: string
  password: string
}
