import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--color-background)', color: 'var(--color-on-surface)' }}
    >
      <a href="#main-content" className="skip-link">
        Przejdź do treści głównej
      </a>

      {/* Hero */}
      <section
        id="main-content"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16"
      >
        <h1
          className="text-5xl font-headline mb-4"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-headline)' }}
        >
          The Editorial Archive
        </h1>
        <p
          className="text-xl max-w-2xl mb-8"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Cyfrowe Archiwum Społecznościowe — odkrywaj historię przez zdjęcia
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            to="/explore"
            className="px-6 py-3 rounded-full font-medium transition-opacity hover:opacity-90 focus-visible:ring-2"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
            }}
          >
            Przeglądaj archiwum
          </Link>
          <Link
            to="/search"
            className="px-6 py-3 rounded-full font-medium border transition-colors hover:opacity-90"
            style={{
              borderColor: 'var(--color-outline)',
              color: 'var(--color-on-surface)',
            }}
          >
            Szukaj zdjęć
          </Link>
        </div>
      </section>
    </main>
  )
}
