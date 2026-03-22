import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Tag as TagIcon,
  User,
  Eye,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react'
import { usePhoto, useRelatedPhotos } from '@/hooks/usePhotos'
import { useBreadcrumbs } from '@/hooks/useHierarchy'
import { photosApi } from '@/api/photos.api'
import HierarchyBreadcrumb from '@/components/hierarchy/HierarchyBreadcrumb/HierarchyBreadcrumb'
import PhotoCard from '@/components/photo/PhotoCard/PhotoCard'
import Skeleton from '@/components/ui/Skeleton/Skeleton'

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: photo, isLoading } = usePhoto(id!)
  const { data: related } = useRelatedPhotos(id!)
  const { data: breadcrumbs } = useBreadcrumbs(photo?.hierarchyNodeId ?? undefined)

  useEffect(() => {
    if (id) {
      photosApi.incrementView(id).catch(() => {/* ignore */})
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-lg" style={{ color: 'var(--color-on-surface-variant)' }}>
          Nie znaleziono zdjęcia.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 text-sm hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Wróć do strony głównej
        </Link>
      </div>
    )
  }

  const dateLabel = photo.photoDateLabel
    ?? (photo.photoDateFrom
      ? photo.photoDateTo && photo.photoDateTo !== photo.photoDateFrom
        ? `${photo.photoDateFrom.slice(0, 4)}–${photo.photoDateTo.slice(0, 4)}`
        : photo.photoDateFrom.slice(0, 4)
      : null)

  const imageSrc = photo.mediumUrl ?? photo.thumbnailUrl ?? null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Powrót do archiwum
      </Link>

      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-4">
          <HierarchyBreadcrumb breadcrumbs={breadcrumbs} />
        </div>
      )}

      {/* Main layout */}
      <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Image */}
        <div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--color-surface-variant)' }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={photo.title}
                className="w-full object-contain max-h-[70vh]"
              />
            ) : (
              <div
                className="flex items-center justify-center aspect-[4/3] text-6xl select-none"
                aria-label="Podgląd niedostępny"
              >
                📷
              </div>
            )}
          </div>

          {photo.licenseNotes && (
            <p className="mt-2 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
              {photo.licenseNotes}
            </p>
          )}
        </div>

        {/* Metadata panel */}
        <aside>
          {/* Title + accession */}
          <h1
            className="text-2xl font-headline leading-tight mb-1"
            style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
          >
            {photo.title}
          </h1>
          {photo.accessionNumber && (
            <p className="text-xs mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
              {photo.accessionNumber}
            </p>
          )}

          <dl className="flex flex-col gap-3">
            {dateLabel && (
              <div className="flex items-start gap-2">
                <dt aria-label="Data">
                  <Calendar size={15} aria-hidden="true" style={{ color: 'var(--color-primary)', marginTop: 1 }} />
                </dt>
                <dd className="text-sm" style={{ color: 'var(--color-on-surface)' }}>
                  {dateLabel}
                </dd>
              </div>
            )}

            {photo.locationName && (
              <div className="flex items-start gap-2">
                <dt aria-label="Lokalizacja">
                  <MapPin size={15} aria-hidden="true" style={{ color: 'var(--color-primary)', marginTop: 1 }} />
                </dt>
                <dd className="text-sm" style={{ color: 'var(--color-on-surface)' }}>
                  {photo.locationName}
                  {photo.hierarchyNodeName && (
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>
                      {' '}· {photo.hierarchyNodeName}
                    </span>
                  )}
                </dd>
              </div>
            )}

            {photo.uploaderName && (
              <div className="flex items-start gap-2">
                <dt aria-label="Autor przesłania">
                  <User size={15} aria-hidden="true" style={{ color: 'var(--color-primary)', marginTop: 1 }} />
                </dt>
                <dd className="text-sm" style={{ color: 'var(--color-on-surface)' }}>
                  {photo.uploaderName}
                </dd>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Eye size={15} aria-hidden="true" style={{ color: 'var(--color-on-surface-variant)' }} />
              <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                {photo.viewCount.toLocaleString('pl-PL')} wyświetleń
              </span>
            </div>
          </dl>

          {photo.description && (
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {photo.description}
            </p>
          )}

          {photo.tags.length > 0 && (
            <div className="mt-4">
              <p
                className="text-xs font-medium mb-1.5 flex items-center gap-1"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                <TagIcon size={12} aria-hidden="true" />
                Tagi
              </p>
              <div className="flex flex-wrap gap-1.5">
                {photo.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/search?q=${encodeURIComponent(tag.name)}`}
                    className="px-2 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                    style={{
                      background: 'var(--color-primary-fixed)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div
            className="mt-4 pt-4 border-t text-xs"
            style={{
              borderColor: 'var(--color-surface-variant)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            <div className="flex items-center gap-1">
              <ExternalLink size={11} aria-hidden="true" />
              <span>{photo.rightsStatement}</span>
            </div>
            {photo.originalFilename && (
              <p className="mt-1">Plik: {photo.originalFilename}</p>
            )}
          </div>
        </aside>
      </div>

      {/* Related photos */}
      {related && related.length > 0 && (
        <section className="mt-10">
          <h2
            className="text-lg font-headline mb-4"
            style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
          >
            Powiązane zdjęcia
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {related.slice(0, 8).map((r) => (
              <PhotoCard key={r.id} photo={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
