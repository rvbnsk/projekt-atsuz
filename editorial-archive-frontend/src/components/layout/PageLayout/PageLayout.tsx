import TopAppBar from '@/components/layout/TopAppBar/TopAppBar'
import BottomNav from '@/components/layout/BottomNav/BottomNav'

interface PageLayoutProps {
  children: React.ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-background)', color: 'var(--color-on-surface)' }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:rounded focus:text-sm focus:font-medium"
        style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
      >
        Przejdź do treści głównej
      </a>
      <TopAppBar />

      {/* Main content — pb-16 reserves space for mobile BottomNav */}
      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
