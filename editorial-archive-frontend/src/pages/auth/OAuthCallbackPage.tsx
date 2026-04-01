import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/api/client'
import type { AuthResponse } from '@/types/auth.types'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const refresh = searchParams.get('refresh')

    if (!token || !refresh) {
      navigate('/auth/login', { replace: true })
      return
    }

    apiClient
      .get<AuthResponse['user']>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setAuth(data, token, refresh)
        navigate('/', { replace: true })
      })
      .catch(() => {
        navigate('/auth/login', { replace: true })
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-background)' }}
    >
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{
          borderColor: 'var(--color-surface-variant)',
          borderTopColor: 'var(--color-primary)',
        }}
        aria-label="Logowanie…"
        role="status"
      />
    </div>
  )
}
