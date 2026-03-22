import { Link } from 'react-router-dom'
import { MapPin, Calendar } from 'lucide-react'
import type { Photo } from '@/types/photo.types'
import { cn } from '@/utils/cn'

interface PhotoCardProps {
  photo: Photo
  className?: string
}

export default function PhotoCard({ photo, className }: PhotoCardProps) {
  const dateLabel = photo.photoDateLabel
    ?? (photo.photoDateFrom ? photo.photoDateFrom.slice(0, 4) : null)

  return (
    <Link
      to={`/photos/${photo.id}`}
      className={cn(
        'group block rounded-xl overflow-hidden transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2',
        className,
      )}
      style={{
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)',
      }}
      aria-label={photo.title}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-[var(--color-surface-variant)] overflow-hidden">
        {photo.thumbnailUrl ? (
          <img
            src={photo.thumbnailUrl}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl select-none"
            aria-hidden="true"
          >
            📷
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p
          className="text-sm font-medium leading-snug line-clamp-2"
          style={{ color: 'var(--color-on-surface)' }}
        >
          {photo.title}
        </p>

        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
          {dateLabel && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              <Calendar size={11} aria-hidden="true" />
              {dateLabel}
            </span>
          )}
          {photo.locationName && (
            <span
              className="flex items-center gap-1 text-xs truncate"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              <MapPin size={11} aria-hidden="true" />
              <span className="truncate">{photo.locationName}</span>
            </span>
          )}
        </div>

        {photo.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {photo.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  background: 'var(--color-primary-fixed)',
                  color: 'var(--color-primary)',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
