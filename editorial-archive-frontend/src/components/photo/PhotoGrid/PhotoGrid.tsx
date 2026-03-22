import type { Photo } from '@/types/photo.types'
import PhotoCard from '@/components/photo/PhotoCard/PhotoCard'
import { PhotoCardSkeleton } from '@/components/ui/Skeleton/Skeleton'

interface PhotoGridProps {
  photos: Photo[]
  loading?: boolean
  skeletonCount?: number
  emptyMessage?: string
}

export default function PhotoGrid({
  photos,
  loading = false,
  skeletonCount = 12,
  emptyMessage = 'Brak zdjęć do wyświetlenia.',
}: PhotoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <PhotoCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <p
        className="py-12 text-center text-sm"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  )
}
