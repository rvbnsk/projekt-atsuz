import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Calendar, MapPin } from 'lucide-react'
import { photosApi } from '@/api/photos.api'
import PhotoStatusBadge from '@/components/photo/PhotoStatusBadge/PhotoStatusBadge'
import { PhotoCardSkeleton } from '@/components/ui/Skeleton/Skeleton'
import type { PhotoStatus } from '@/types/photo.types'

const STATUS_TABS: { label: string; value: PhotoStatus | 'ALL' }[] = [
  { label: 'Wszystkie',  value: 'ALL' },
  { label: 'Oczekuje',   value: 'PENDING' },
  { label: 'Zatwierdzone', value: 'APPROVED' },
  { label: 'Odrzucone',  value: 'REJECTED' },
  { label: 'Do poprawy', value: 'NEEDS_CORRECTION' },
]

export default function MyCollectionPage() {
  const [status, setStatus] = useState<PhotoStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['my-photos', page],
    queryFn: () => photosApi.myPhotos({ page, size: 20 }),
  })

  const photos = (data?.data ?? []).filter(
    (p) => status === 'ALL' || p.status === status,
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1
          className="text-2xl font-headline"
          style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
        >
          Moja kolekcja
        </h1>
        <Link
          to="/upload"
          className="px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          + Dodaj zdjęcie
        </Link>
      </div>

      {/* Status tabs */}
      <div
        className="flex gap-1 flex-wrap mb-5 p-1 rounded-xl w-fit"
        role="tablist"
        aria-label="Filtr statusu"
        style={{ background: 'var(--color-surface-variant)' }}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => { setStatus(tab.value); setPage(0) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: status === tab.value ? 'var(--color-surface)' : 'transparent',
              color: status === tab.value ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
              boxShadow: status === tab.value ? 'var(--shadow-card)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <PhotoCardSkeleton key={i} />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
            Brak zdjęć w tej kategorii.
          </p>
          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-full text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Prześlij pierwsze zdjęcie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => {
            const dateLabel = photo.photoDateLabel ?? photo.photoDateFrom?.slice(0, 4)
            return (
              <div
                key={photo.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-[var(--color-surface-variant)] overflow-hidden">
                  {photo.thumbnailUrl ? (
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl" aria-hidden="true">
                      📷
                    </div>
                  )}
                  {/* Status badge overlay */}
                  <div className="absolute top-1.5 left-1.5">
                    <PhotoStatusBadge status={photo.status} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p
                    className="text-xs font-medium line-clamp-2 mb-1"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    {photo.title}
                  </p>
                  <div className="flex gap-2 text-[10px]" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {dateLabel && (
                      <span className="flex items-center gap-0.5">
                        <Calendar size={9} aria-hidden="true" />{dateLabel}
                      </span>
                    )}
                    {photo.locationName && (
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin size={9} aria-hidden="true" />{photo.locationName}
                      </span>
                    )}
                  </div>
                  {photo.rejectionReason && (
                    <p
                      className="mt-1 text-[10px] line-clamp-2"
                      style={{ color: 'var(--color-error)' }}
                    >
                      {photo.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Edit */}
                <div className="px-2.5 pb-2.5">
                  <Link
                    to={`/my-collection/${photo.id}/edit`}
                    className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-[var(--color-surface-variant)]"
                    style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
                  >
                    <Pencil size={11} aria-hidden="true" />
                    Edytuj
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-full text-sm disabled:opacity-40 hover:bg-[var(--color-surface-variant)]"
            style={{ color: 'var(--color-on-surface)' }}
          >
            ← Poprzednia
          </button>
          <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {page + 1} / {data.pagination.totalPages}
          </span>
          <button
            disabled={page + 1 >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-full text-sm disabled:opacity-40 hover:bg-[var(--color-surface-variant)]"
            style={{ color: 'var(--color-on-surface)' }}
          >
            Następna →
          </button>
        </div>
      )}
    </div>
  )
}
