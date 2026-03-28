import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { photosApi } from '@/api/photos.api'
import PhotoStatusBadge from '@/components/photo/PhotoStatusBadge/PhotoStatusBadge'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import type { Photo } from '@/types/photo.types'

const ACTIONS = [
  { status: 'APPROVED', label: 'Zatwierdź', bg: 'var(--color-primary)', color: 'var(--color-on-primary)' },
  { status: 'REJECTED', label: 'Odrzuć', bg: 'var(--color-error)', color: '#fff' },
  { status: 'NEEDS_CORRECTION', label: 'Do poprawy', bg: '#3730a3', color: '#fff' },
]

function PhotoRow({ photo, onAction }: { photo: Photo; onAction: (id: string, status: string, reason?: string) => void }) {
  const [reason, setReason] = useState('')
  const [showReason, setShowReason] = useState(false)

  const handleAction = (status: string) => {
    if (status === 'REJECTED' || status === 'NEEDS_CORRECTION') {
      if (!showReason) { setShowReason(true); return }
    }
    onAction(photo.id, status, reason || undefined)
    setShowReason(false)
    setReason('')
  }

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)' }}
    >
      <div className="flex gap-3 items-start">
        {photo.thumbnailUrl ? (
          <img
            src={photo.thumbnailUrl}
            alt={photo.title}
            className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-20 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl"
            style={{ background: 'var(--color-surface-variant)' }}
          >
            🖼
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate" style={{ color: 'var(--color-on-surface)' }}>
            {photo.title}
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
            {photo.uploaderName ?? 'Nieznany'} · {photo.photoDateLabel ?? '—'}
          </div>
          {photo.description && (
            <div
              className="text-sm mt-1 line-clamp-2"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {photo.description}
            </div>
          )}
        </div>
        <PhotoStatusBadge status={photo.status} />
      </div>

      {showReason && (
        <input
          type="text"
          placeholder="Powód (opcjonalny)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-outline)',
            color: 'var(--color-on-surface)',
          }}
        />
      )}

      <div className="flex gap-2 flex-wrap">
        {ACTIONS.map(({ status, label, bg, color }) => (
          <button
            key={status}
            onClick={() => handleAction(status)}
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ background: bg, color }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ModerationPage() {
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending', page],
    queryFn: () => photosApi.getPending({ page, size: 20 }),
  })

  const mutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      photosApi.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const photos = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-headline"
          style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
        >
          Kolejka moderacji
        </h1>
        {data && (
          <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {data.pagination.totalElements} zdjęć
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <p className="text-sm py-12 text-center" style={{ color: 'var(--color-on-surface-variant)' }}>
          Brak zdjęć do moderacji.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {photos.map((photo) => (
            <PhotoRow
              key={photo.id}
              photo={photo}
              onAction={(id, status, reason) => mutation.mutate({ id, status, reason })}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-full text-sm disabled:opacity-40"
            style={{ background: 'var(--color-surface-variant)', color: 'var(--color-on-surface)' }}
          >
            Wstecz
          </button>
          <span className="px-4 py-2 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-full text-sm disabled:opacity-40"
            style={{ background: 'var(--color-surface-variant)', color: 'var(--color-on-surface)' }}
          >
            Dalej
          </button>
        </div>
      )}
    </div>
  )
}
