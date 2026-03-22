import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="p-8">
      <h1
        className="text-3xl mb-2"
        style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-primary)' }}
      >
        Witaj, {user?.displayName}!
      </h1>
      <p className="mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
        Panel twórcy archiwum
      </p>

      <div className="flex gap-4 flex-wrap">
        <Link
          to="/upload"
          className="px-6 py-3 rounded-full font-medium"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          Prześlij zdjęcie
        </Link>
        <Link
          to="/my-collection"
          className="px-6 py-3 rounded-full font-medium border"
          style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
        >
          Moja kolekcja
        </Link>
      </div>
    </div>
  )
}
