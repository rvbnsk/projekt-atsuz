import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHierarchyTree, useBreadcrumbs } from '@/hooks/useHierarchy'
import { usePhotoSearch } from '@/hooks/usePhotos'
import HierarchyTree from '@/components/hierarchy/HierarchyTree/HierarchyTree'
import HierarchyBreadcrumb from '@/components/hierarchy/HierarchyBreadcrumb/HierarchyBreadcrumb'
import PhotoGrid from '@/components/photo/PhotoGrid/PhotoGrid'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import type { HierarchyNode } from '@/types/hierarchy.types'
import { ChevronLeft } from 'lucide-react'

export default function ExplorePage() {
  const { nodeId } = useParams<{ nodeId?: string }>()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: tree, isLoading: treeLoading } = useHierarchyTree()
  const { data: breadcrumbs } = useBreadcrumbs(nodeId)
  const { data: photosData, isLoading: photosLoading } = usePhotoSearch(
    nodeId ? { nodeId } : { yearFrom: undefined },
  )

  const handleSelect = (node: HierarchyNode) => {
    navigate(`/explore/${node.id}`)
    setSidebarOpen(false)
  }

  const handleReset = () => {
    navigate('/explore')
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:block w-64 shrink-0 border-r sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto p-4"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-surface-variant)',
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Lokalizacja
        </h2>
        {treeLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6" />
            ))}
          </div>
        ) : (
          tree && (
            <HierarchyTree
              nodes={tree}
              selectedId={nodeId}
              onSelect={handleSelect}
            />
          )
        )}
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium shadow-lg"
        style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        onClick={() => setSidebarOpen((v) => !v)}
        aria-expanded={sidebarOpen}
        aria-controls="mobile-sidebar"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Lokalizacja
      </button>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-20 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-sidebar"
            className="md:hidden fixed left-0 top-14 bottom-16 z-30 w-72 overflow-y-auto p-4"
            style={{ background: 'var(--color-surface)' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Lokalizacja
            </h2>
            {tree && (
              <HierarchyTree
                nodes={tree}
                selectedId={nodeId}
                onSelect={handleSelect}
              />
            )}
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 min-w-0">
        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <HierarchyBreadcrumb
              breadcrumbs={breadcrumbs}
              onReset={handleReset}
            />
          </div>
        )}

        <div className="flex items-baseline justify-between mb-4">
          <h1
            className="text-2xl font-headline"
            style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
          >
            {breadcrumbs && breadcrumbs.length > 0
              ? breadcrumbs[breadcrumbs.length - 1].name
              : 'Całe archiwum'}
          </h1>
          {photosData && (
            <span
              className="text-sm"
              style={{ color: 'var(--color-on-surface-variant)' }}
              role="status"
              aria-live="polite"
            >
              {photosData.pagination.totalElements} zdjęć
            </span>
          )}
        </div>

        <PhotoGrid
          photos={photosData?.data ?? []}
          loading={photosLoading}
          emptyMessage="Brak zdjęć w tej lokalizacji."
        />

        {/* Pagination */}
        {photosData && photosData.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2" role="navigation" aria-label="Paginacja">
            <span
              className="px-4 py-2 rounded-full text-sm"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Strona {photosData.pagination.page + 1} z {photosData.pagination.totalPages}
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
