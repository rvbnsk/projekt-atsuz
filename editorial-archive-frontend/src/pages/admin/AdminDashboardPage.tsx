import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/admin.api'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import type { StatsDto } from '@/types/admin.types'

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--color-surface-variant)' }}
    >
      <span className="text-2xl font-bold" style={{ color: color ?? 'var(--color-on-surface)' }}>
        {value.toLocaleString()}
      </span>
      <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
        {label}
      </span>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<StatsDto>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1
        className="text-2xl font-headline mb-6"
        style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
      >
        Panel administratora
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Wszystkich zdjęć" value={stats.totalPhotos} />
          <StatCard label="Zatwierdzonych" value={stats.approvedPhotos} color="var(--color-primary)" />
          <StatCard label="Oczekujących" value={stats.pendingPhotos} color="#92400e" />
          <StatCard label="Odrzuconych" value={stats.rejectedPhotos} color="var(--color-error)" />
          <StatCard label="Użytkowników" value={stats.totalUsers} />
          <StatCard label="Tagów" value={stats.totalTags} />
          <StatCard label="Węzłów hierarchii" value={stats.totalHierarchyNodes} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { to: '/admin/moderation', label: 'Kolejka moderacji', desc: 'Zatwierdź lub odrzuć przesłane zdjęcia' },
          { to: '/admin/users', label: 'Zarządzanie użytkownikami', desc: 'Blokowanie kont i zmiana ról' },
          { to: '/admin/audit', label: 'Log audytu', desc: 'Historia zdarzeń systemowych' },
        ].map(({ to, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl p-4 border hover:border-[var(--color-primary)] transition-colors"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-outline)',
              color: 'var(--color-on-surface)',
            }}
          >
            <div className="font-medium mb-0.5">{label}</div>
            <div className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
