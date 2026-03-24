import { useState, type FormEvent, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { usePhotoSearch } from '@/hooks/usePhotos'
import type { PhotoSearchParams } from '@/types/photo.types'

// Lazy-load map to avoid SSR/bundle issues with Leaflet
const ArchiveMap = lazy(() => import('@/components/map/ArchiveMap/ArchiveMap'))

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') ?? '')
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') ?? '')
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const [activeParams, setActiveParams] = useState<PhotoSearchParams>(() => ({
    q: searchParams.get('q') ?? undefined,
    yearFrom: searchParams.get('yearFrom') ? Number(searchParams.get('yearFrom')) : undefined,
    yearTo: searchParams.get('yearTo') ? Number(searchParams.get('yearTo')) : undefined,
    // Fetch a large page so the map is well-populated
    page: 0,
    size: 500,
  }))

  const { data, isLoading } = usePhotoSearch(activeParams)

  const photos = data?.data ?? []
  const geoCount = photos.filter((p) => p.latitude != null && p.longitude != null).length

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params: PhotoSearchParams = {
      q: query.trim() || undefined,
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      page: 0,
      size: 500,
    }
    setActiveParams(params)

    const urlParams: Record<string, string> = {}
    if (query.trim()) urlParams.q = query.trim()
    if (yearFrom) urlParams.yearFrom = yearFrom
    if (yearTo) urlParams.yearTo = yearTo
    setSearchParams(urlParams)
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setQuery('')
    setYearFrom('')
    setYearTo('')
    setSearchParams({})
    setActiveParams({ page: 0, size: 500 })
  }

  const hasFilters = !!(activeParams.q || activeParams.yearFrom || activeParams.yearTo)

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <div
        className="shrink-0 border-b flex items-center gap-2 px-3 py-2"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-surface-variant)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Filtrowanie mapy"
          className="flex items-center flex-1 gap-2"
        >
          <div
            className="flex items-center flex-1 rounded-full border overflow-hidden"
            style={{
              background: 'var(--color-background)',
              borderColor: 'var(--color-outline)',
            }}
          >
            <label htmlFor="map-search" className="sr-only">Szukaj na mapie</label>
            <input
              id="map-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Wyszukaj zdjęcia na mapie…"
              className="flex-1 px-4 py-2 bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-on-surface)' }}
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium shrink-0"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              <Search size={14} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-label="Filtry"
            className="flex items-center gap-1 px-3 py-2 rounded-full border text-sm"
            style={{
              borderColor: filtersOpen ? 'var(--color-primary)' : 'var(--color-outline)',
              color: filtersOpen ? 'var(--color-primary)' : 'var(--color-on-surface)',
              background: filtersOpen ? 'var(--color-primary-fixed)' : 'transparent',
            }}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Filtry</span>
          </button>
        </form>

        {/* Status */}
        <span
          className="text-xs shrink-0 hidden sm:block"
          style={{ color: 'var(--color-on-surface-variant)' }}
          role="status"
          aria-live="polite"
        >
          {isLoading ? 'Ładowanie…' : `${geoCount} lok.`}
        </span>

        {hasFilters && (
          <button
            onClick={clearFilters}
            aria-label="Wyczyść filtry"
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--color-surface-variant)]"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Expandable filter row */}
      {filtersOpen && (
        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-b px-4 py-3 flex flex-wrap gap-3 items-end"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-surface-variant)',
          }}
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="map-year-from"
              className="text-xs font-medium"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Rok od
            </label>
            <input
              id="map-year-from"
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="np. 1945"
              min={1800}
              max={2024}
              className="w-28 px-3 py-1.5 rounded-lg text-sm outline-none border"
              style={{
                background: 'var(--color-background)',
                borderColor: 'var(--color-outline)',
                color: 'var(--color-on-surface)',
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="map-year-to"
              className="text-xs font-medium"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Rok do
            </label>
            <input
              id="map-year-to"
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="np. 1989"
              min={1800}
              max={2024}
              className="w-28 px-3 py-1.5 rounded-lg text-sm outline-none border"
              style={{
                background: 'var(--color-background)',
                borderColor: 'var(--color-outline)',
                color: 'var(--color-on-surface)',
              }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Zastosuj
          </button>
        </form>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ background: 'var(--color-surface-variant)' }}
          >
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'var(--color-surface)',
                borderTopColor: 'var(--color-primary)',
              }}
              role="status"
              aria-label="Ładowanie mapy"
            />
          </div>
        )}

        {geoCount === 0 && !isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            <p
              className="text-sm px-4 py-2 rounded-xl"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-on-surface-variant)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              Brak zdjęć z danymi lokalizacji dla wybranych filtrów.
            </p>
          </div>
        )}

        <Suspense fallback={<div className="w-full h-full" style={{ background: 'var(--color-surface-variant)' }} />}>
          <ArchiveMap
            photos={photos}
            height="100%"
            autoFit={photos.length > 0}
          />
        </Suspense>
      </div>
    </div>
  )
}
