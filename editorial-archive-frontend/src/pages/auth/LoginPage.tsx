import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    try {
      const response = await authApi.login(data)
      setAuth(response.user, response.accessToken, response.refreshToken)
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      setError(msg ?? 'Logowanie nie powiodło się')
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-background)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-xl shadow-card"
        style={{ background: 'var(--color-surface)' }}
      >
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-primary)' }}
        >
          Zaloguj się
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Nie masz konta?{' '}
          <Link
            to="/auth/register"
            className="underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Zarejestruj się
          </Link>
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-md text-sm"
            style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={{
                borderColor: errors.email ? 'var(--color-error)' : 'var(--color-outline)',
                background: 'var(--color-surface)',
                color: 'var(--color-on-surface)',
              }}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Hasło
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={{
                borderColor: errors.password ? 'var(--color-error)' : 'var(--color-outline)',
                background: 'var(--color-surface)',
                color: 'var(--color-on-surface)',
              }}
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p
                id="password-error"
                className="mt-1 text-xs"
                style={{ color: 'var(--color-error)' }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full font-medium transition-opacity disabled:opacity-60"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </main>
  )
}
