import { Link } from 'react-router-dom'
import { Upload, Images, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { photosApi } from '@/api/photos.api'
import PhotoStatusBadge from '@/components/photo/PhotoStatusBadge/PhotoStatusBadge'
import Skeleton from '@/components/ui/Skeleton/Skeleton'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['my-photos-dashboard'],
    queryFn: () => photosApi.myPhotos({ page: 0, size: 5 }),
  })

  const { data: pendingData } = useQuery({
    queryKey: ['my-photos-count', 'PENDING'],
    queryFn: () => photosApi.myPhotos({ page: 0, size: 1, status: 'PENDING' }),
  })

  const { data: approvedData } = useQuery({
    queryKey: ['my-photos-count', 'APPROVED'],
    queryFn: () => photosApi.myPhotos({ page: 0, size: 1, status: 'APPROVED' }),
  })

  const { data: rejectedData } = useQuery({
    queryKey: ['my-photos-count', 'REJECTED'],
    queryFn: () => photosApi.myPhotos({ page: 0, size: 1, status: 'REJECTED' }),
  })

  const recent = data?.data ?? []
  const counts = {
    total: data?.pagination.totalElements ?? 0,
    pending: pendingData?.pagination.totalElements ?? 0,
    approved: approvedData?.pagination.totalElements ?? 0,
    rejected: rejectedData?.pagination.totalElements ?? 0,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1
        className="text-2xl font-headline mb-1"
        style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-primary)' }}
      >
        Witaj, {user?.displayName}!
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
        Panel twórcy archiwum
      </p>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap mb-6">
        <Link
          to="/upload"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          <Upload size={14} aria-hidden="true" />
          Prześlij zdjęcie
        </Link>
        <Link
          to="/my-collection"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border"
          style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
        >
          <Images size={14} aria-hidden="true" />
          Moja kolekcja
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard icon={<Images size={20} />} label="Wszystkich" value={counts.total} />
            <StatCard icon={<Clock size={20} />} label="Oczekuje" value={counts.pending} accent="#92400e" />
            <StatCard icon={<CheckCircle size={20} />} label="Zatwierdzonych" value={counts.approved} accent="var(--color-primary)" />
            <StatCard icon={<XCircle size={20} />} label="Odrzuconych" value={counts.rejected} accent="var(--color-error)" />
          </>
        )}
      </div>

      {/* Recent uploads */}
      {recent.length > 0 && (
        <section>
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            Ostatnio przesłane
          </h2>
          <div className="flex flex-col gap-2">
            {recent.map((photo) => (
              <div
                key={photo.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                  style={{ background: 'var(--color-surface-variant)' }}
                >
                  {photo.thumbnailUrl ? (
                    <img
                      src={photo.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base" aria-hidden="true">📷</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    {photo.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {photo.photoDateLabel ?? photo.photoDateFrom?.slice(0, 4) ?? '—'}
                  </p>
                </div>
                <PhotoStatusBadge status={photo.status} />
                <Link
                  to={`/my-collection/${photo.id}/edit`}
                  className="text-xs px-2 py-1 rounded-lg border transition-colors hover:bg-[var(--color-surface-variant)]"
                  style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
                >
                  Edytuj
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && counts.total === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
            Nie masz jeszcze żadnych przesłanych zdjęć.
          </p>
          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-full text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Prześlij pierwsze zdjęcie
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent = 'var(--color-on-surface-variant)',
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: string
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <div style={{ color: accent }}>{icon}</div>
      <p className="text-2xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
        {label}
      </p>
    </div>
  )
}
