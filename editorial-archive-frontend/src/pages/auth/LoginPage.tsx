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
              required
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
              required
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
            aria-busy={isSubmitting}
            className="w-full py-3 rounded-full font-medium transition-opacity disabled:opacity-60"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            {isSubmitting ? 'Logowanie…' : 'Zaloguj się'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center my-4">
            <div className="flex-1 border-t" style={{ borderColor: 'var(--color-outline)' }} />
            <span className="mx-3 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
              lub zaloguj się przez
            </span>
            <div className="flex-1 border-t" style={{ borderColor: 'var(--color-outline)' }} />
          </div>

          <div className="flex flex-col gap-2">
            <a
              href="/oauth2/authorization/google"
              className="flex items-center justify-center gap-3 w-full py-2.5 rounded-full border text-sm font-medium transition-colors hover:bg-[var(--color-surface-variant)]"
              style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </a>
            <a
              href="/oauth2/authorization/facebook"
              className="flex items-center justify-center gap-3 w-full py-2.5 rounded-full border text-sm font-medium transition-colors hover:bg-[var(--color-surface-variant)]"
              style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
