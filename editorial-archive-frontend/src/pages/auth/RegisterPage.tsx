import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const registerSchema = z.object({
  displayName: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').max(100),
  email: z.string().email('Nieprawidłowy format email'),
  password: z
    .string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    try {
      const response = await authApi.register(data)
      setAuth(response.user, response.accessToken, response.refreshToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      setError(msg ?? 'Rejestracja nie powiodła się')
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-8"
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
          Utwórz konto
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Masz już konto?{' '}
          <Link to="/auth/login" className="underline" style={{ color: 'var(--color-primary)' }}>
            Zaloguj się
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
          {[
            { id: 'displayName', label: 'Imię i nazwisko', type: 'text', autocomplete: 'name' },
            { id: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
            { id: 'password', label: 'Hasło', type: 'password', autocomplete: 'new-password' },
          ].map(({ id, label, type, autocomplete }) => {
            const field = id as keyof RegisterFormData
            return (
              <div key={id} className="mb-4">
                <label
                  htmlFor={id}
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-on-surface)' }}
                >
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  autoComplete={autocomplete}
                  {...register(field)}
                  className="w-full px-3 py-2 rounded-md border text-sm"
                  style={{
                    borderColor: errors[field]
                      ? 'var(--color-error)'
                      : 'var(--color-outline)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                  }}
                  aria-invalid={!!errors[field]}
                />
                {errors[field] && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
                    {errors[field]?.message}
                  </p>
                )}
              </div>
            )
          })}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full py-3 rounded-full font-medium transition-opacity disabled:opacity-60"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            {isSubmitting ? 'Tworzenie konta...' : 'Utwórz konto'}
          </button>
        </form>
      </div>
    </main>
  )
}
