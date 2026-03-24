import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePhotoSearch } from '@/hooks/usePhotos'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import type { Photo } from '@/types/photo.types'

function getDecade(photo: Photo): number | null {
  if (!photo.photoDateFrom) return null
  const year = parseInt(photo.photoDateFrom.slice(0, 4), 10)
  if (isNaN(year)) return null
  return Math.floor(year / 10) * 10
}

function DecadeColumn({ decade, photos }: { decade: number; photos: Photo[] }) {
  return (
    <div className="shrink-0 w-44 flex flex-col items-center gap-0">
      {/* Decade header */}
      <div
        className="w-full text-center py-2 text-sm font-semibold rounded-t-lg"
        style={{
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          fontFamily: 'var(--font-headline)',
        }}
      >
        {decade}s
      </div>

      {/* Spine */}
      <div
        className="w-0.5 self-stretch"
        style={{ background: 'var(--color-surface-variant)', minHeight: '1.5rem' }}
        aria-hidden="true"
      />

      {/* Photo cards */}
      <div className="flex flex-col gap-3 py-2 w-full">
        {photos.map((photo, i) => {
          const year = photo.photoDateFrom?.slice(0, 4)
          return (
            <div key={photo.id} className="relative flex flex-col items-center">
              {/* Connector dot */}
              <div
                className="w-2.5 h-2.5 rounded-full border-2 mb-1 shrink-0"
                style={{
                  background: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary, #506071)',
                  borderColor: 'var(--color-surface)',
                }}
                aria-hidden="true"
              />
              <Link
                to={`/photos/${photo.id}`}
                className="block group rounded-lg overflow-hidden w-36 transition-shadow hover:shadow-md focus-visible:ring-2"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-card)',
                }}
                aria-label={photo.title}
              >
                {photo.thumbnailUrl ? (
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-full h-24 flex items-center justify-center text-3xl"
                    aria-hidden="true"
                  >
                    📷
                  </div>
                )}
                <div className="px-2 py-1.5">
                  <p
                    className="text-xs font-medium leading-snug line-clamp-2"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    {photo.title}
                  </p>
                  {year && (
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}
                    >
                      {year}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TimelinePage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const { data, isLoading } = usePhotoSearch({ size: 500, page: 0 })

  // Group photos by decade, filter those with a date
  const byDecade = new Map<number, Photo[]>()
  for (const photo of data?.data ?? []) {
    const d = getDecade(photo)
    if (d == null) continue
    if (!byDecade.has(d)) byDecade.set(d, [])
    byDecade.get(d)!.push(photo)
  }
  const decades = Array.from(byDecade.keys()).sort()

  // Drag-to-scroll handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }
  const stopDrag = () => setIsDragging(false)

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const totalPhotos = data?.pagination.totalElements ?? 0
  const datedPhotos = Array.from(byDecade.values()).flat().length

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Header */}
      <div
        className="shrink-0 border-b px-4 py-3 flex items-center justify-between"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-surface-variant)',
        }}
      >
        <div>
          <h1
            className="text-xl font-headline flex items-center gap-2"
            style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
          >
            <Calendar size={18} aria-hidden="true" style={{ color: 'var(--color-primary)' }} />
            Oś czasu
          </h1>
          {!isLoading && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
              {datedPhotos} z {totalPhotos} zdjęć z datą · {decades.length} dekad
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy(-400)}
            aria-label="Przewiń w lewo"
            className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors hover:bg-[var(--color-surface-variant)]"
            style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollBy(400)}
            aria-label="Przewiń w prawo"
            className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors hover:bg-[var(--color-surface-variant)]"
            style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Timeline scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'var(--color-background)',
          userSelect: 'none',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        aria-label="Oś czasu zdjęć"
      >
        {isLoading ? (
          <div className="flex gap-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 w-44 flex flex-col gap-3">
                <Skeleton className="h-8 w-full rounded-t-lg" />
                <Skeleton className="h-32 w-36 rounded-lg mx-auto" />
                <Skeleton className="h-24 w-36 rounded-lg mx-auto" />
              </div>
            ))}
          </div>
        ) : decades.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Brak zdjęć z informacją o dacie.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 px-6 py-4 items-start min-h-full">
            {/* Horizontal spine line */}
            <div className="absolute left-6 right-6" style={{ display: 'none' }} aria-hidden="true" />

            {decades.map((decade) => (
              <DecadeColumn
                key={decade}
                decade={decade}
                photos={byDecade.get(decade)!}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
