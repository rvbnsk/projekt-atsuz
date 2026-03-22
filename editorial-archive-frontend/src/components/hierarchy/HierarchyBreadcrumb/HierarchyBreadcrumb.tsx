import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import type { Breadcrumb } from '@/types/hierarchy.types'

interface HierarchyBreadcrumbProps {
  breadcrumbs: Breadcrumb[]
  /** Called when the "All" / root link is clicked */
  onReset?: () => void
}

export default function HierarchyBreadcrumb({ breadcrumbs, onReset }: HierarchyBreadcrumbProps) {
  return (
    <nav aria-label="Ścieżka lokalizacji">
      <ol className="flex items-center flex-wrap gap-1 text-sm" role="list">
        <li>
          <button
            onClick={onReset}
            className="flex items-center gap-1 hover:underline focus-visible:underline"
            style={{ color: 'var(--color-on-surface-variant)' }}
            aria-label="Wszystkie lokalizacje"
          >
            <Home size={13} aria-hidden="true" />
            <span>Wszystkie</span>
          </button>
        </li>

        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1
          return (
            <li key={crumb.id} className="flex items-center gap-1">
              <ChevronRight size={12} aria-hidden="true" style={{ color: 'var(--color-outline)' }} />
              {isLast ? (
                <span
                  className="font-semibold"
                  aria-current="page"
                  style={{ color: 'var(--color-on-surface)' }}
                >
                  {crumb.name}
                </span>
              ) : (
                <Link
                  to={`/explore/${crumb.id}`}
                  className="hover:underline focus-visible:underline"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
