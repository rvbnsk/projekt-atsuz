import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { usePhotoList } from '@/hooks/usePhotos'
import PhotoGrid from '@/components/photo/PhotoGrid/PhotoGrid'

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { data, isLoading } = usePhotoList({ size: 12 })

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 pt-16 pb-12">
        <h1
          className="text-4xl md:text-5xl font-headline mb-3"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-headline)' }}
        >
          The Editorial Archive
        </h1>
        <p
          className="text-lg max-w-xl mb-8"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Cyfrowe Archiwum Społecznościowe — odkrywaj historię przez zdjęcia
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-xl flex items-center rounded-full border overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-outline)',
            boxShadow: 'var(--shadow-card)',
          }}
          role="search"
          aria-label="Wyszukiwanie w archiwum"
        >
          <label htmlFor="hero-search" className="sr-only">
            Szukaj w archiwum
          </label>
          <input
            id="hero-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj miejsca, roku, nazwy…"
            className="flex-1 px-5 py-3 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-on-surface)' }}
          />
          <button
            type="submit"
            className="px-5 py-3 shrink-0 flex items-center gap-2 text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            aria-label="Szukaj"
          >
            <Search size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Szukaj</span>
          </button>
        </form>

        <div className="flex gap-3 mt-6 flex-wrap justify-center">
          <Link
            to="/explore"
            className="px-5 py-2.5 rounded-full text-sm font-medium border transition-colors hover:opacity-90"
            style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
          >
            Przeglądaj hierarchię
          </Link>
        </div>
      </section>

      {/* Recent photos */}
      <section className="px-4 pb-16 max-w-6xl mx-auto w-full">
        <h2
          className="text-xl font-headline mb-4"
          style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-headline)' }}
        >
          Ostatnio dodane
        </h2>
        <PhotoGrid
          photos={data?.data ?? []}
          loading={isLoading}
          skeletonCount={12}
          emptyMessage="W archiwum nie ma jeszcze żadnych zatwierdzonych zdjęć."
        />
      </section>
    </>
  )
}
