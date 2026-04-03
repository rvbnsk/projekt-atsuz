import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { usePhotoSearch } from '@/hooks/usePhotos'
import PhotoGrid from '@/components/photo/PhotoGrid/PhotoGrid'
import type { PhotoSearchParams } from '@/types/photo.types'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') ?? '')
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') ?? '')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [activeParams, setActiveParams] = useState<PhotoSearchParams>(() => ({
    q: searchParams.get('q') ?? undefined,
    yearFrom: searchParams.get('yearFrom') ? Number(searchParams.get('yearFrom')) : undefined,
    yearTo: searchParams.get('yearTo') ? Number(searchParams.get('yearTo')) : undefined,
    page: 0,
    size: 24,
  }))

  const { data, isLoading } = usePhotoSearch(activeParams)

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params: PhotoSearchParams = {
      q: query.trim() || undefined,
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      page: 0,
      size: 24,
    }
    setActiveParams(params)

    const urlParams: Record<string, string> = {}
    if (query.trim()) urlParams.q = query.trim()
    if (yearFrom) urlParams.yearFrom = yearFrom
    if (yearTo) urlParams.yearTo = yearTo
    setSearchParams(urlParams)
  }

  const clearFilters = () => {
    setYearFrom('')
    setYearTo('')
    setQuery('')
    setSearchParams({})
    setActiveParams({ page: 0, size: 24 })
  }

  const hasActiveFilters = !!(activeParams.q || activeParams.yearFrom || activeParams.yearTo)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1
        className="text-2xl font-headline mb-5"
        style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
      >
        Wyszukiwanie zaawansowane
      </h1>

      {/* Search form */}
      <form onSubmit={handleSubmit} role="search" aria-label="Wyszukiwanie w archiwum">
        <div
          className="flex items-center rounded-full border overflow-hidden mb-3"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-outline)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <label htmlFor="search-input" className="sr-only">
            Szukaj
          </label>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Wyszukaj zdjęcia, miejsca, daty…"
            className="flex-1 px-5 py-3 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-on-surface)' }}
          />
          <button
            type="button"
            aria-label="Filtry"
            aria-expanded={filtersOpen}
            aria-controls="search-filters"
            onClick={() => setFiltersOpen((v) => !v)}
            className="px-3 py-3 transition-colors hover:bg-[var(--color-surface-variant)]"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
          </button>
          <button
            type="submit"
            aria-label="Szukaj"
            className="px-5 py-3 shrink-0 flex items-center gap-2 text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <Search size={16} aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">Szukaj</span>
          </button>
        </div>

        {/* Expandable filters */}
        {filtersOpen && (
          <div
            id="search-filters"
            className="rounded-xl p-4 mb-3 flex flex-wrap gap-4"
            style={{
              background: 'var(--color-surface)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--color-surface-variant)',
            }}
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="year-from"
                className="text-xs font-medium"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                Rok od
              </label>
              <input
                id="year-from"
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="np. 1945"
                min={1800}
                max={new Date().getFullYear()}
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
                htmlFor="year-to"
                className="text-xs font-medium"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                Rok do
              </label>
              <input
                id="year-to"
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="np. 1989"
                min={1800}
                max={new Date().getFullYear()}
                className="w-28 px-3 py-1.5 rounded-lg text-sm outline-none border"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-outline)',
                  color: 'var(--color-on-surface)',
                }}
              />
            </div>
          </div>
        )}
      </form>

      {/* Active filters / status bar */}
      <div className="mb-4 flex items-center justify-between min-h-[1.5rem]">
        <p
          className="text-sm"
          style={{ color: 'var(--color-on-surface-variant)' }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isLoading
            ? 'Szukam…'
            : data
              ? `Znaleziono ${data.pagination.totalElements} zdjęć`
              : 'Wpisz frazę lub wybierz filtry'}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs hover:underline"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            <X size={12} aria-hidden="true" />
            Wyczyść filtry
          </button>
        )}
      </div>

      {/* Results */}
      <PhotoGrid
        photos={data?.data ?? []}
        loading={isLoading && hasActiveFilters}
        emptyMessage={
          hasActiveFilters
            ? 'Brak wyników dla podanych kryteriów.'
            : 'Wpisz frazę, aby wyszukać zdjęcia.'
        }
      />

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2" role="navigation" aria-label="Paginacja">
          <button
            disabled={activeParams.page === 0}
            aria-label="Poprzednia strona"
            onClick={() => setActiveParams((p) => ({ ...p, page: (p.page ?? 0) - 1 }))}
            className="px-4 py-2 rounded-full text-sm font-medium disabled:opacity-40 transition-colors hover:bg-[var(--color-surface-variant)]"
            style={{ color: 'var(--color-on-surface)' }}
          >
            <span aria-hidden="true">←</span> Poprzednia
          </button>
          <span
            className="text-sm px-3"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {(activeParams.page ?? 0) + 1} / {data.pagination.totalPages}
          </span>
          <button
            disabled={(activeParams.page ?? 0) + 1 >= data.pagination.totalPages}
            aria-label="Następna strona"
            onClick={() => setActiveParams((p) => ({ ...p, page: (p.page ?? 0) + 1 }))}
            className="px-4 py-2 rounded-full text-sm font-medium disabled:opacity-40 transition-colors hover:bg-[var(--color-surface-variant)]"
            style={{ color: 'var(--color-on-surface)' }}
          >
            Następna <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  )
}
