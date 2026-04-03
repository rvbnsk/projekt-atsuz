import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trash2, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useHierarchyTree } from '@/hooks/useHierarchy'
import { photosApi } from '@/api/photos.api'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import type { HierarchyNode } from '@/types/hierarchy.types'
import type { Photo } from '@/types/photo.types'

function flattenNodes(
  nodes: HierarchyNode[],
  depth = 0,
  result: { id: string; name: string; depth: number }[] = [],
) {
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, depth })
    if (node.children?.length) flattenNodes(node.children, depth + 1, result)
  }
  return result
}

export default function EditPhotoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: photo, isLoading } = useQuery<Photo | null>({
    queryKey: ['my-photo-edit', id],
    queryFn: () => photosApi.myPhotoById(id!),
    enabled: !!id,
  })
  const { data: hierarchyTree } = useHierarchyTree()
  const flatNodes = hierarchyTree ? flattenNodes(hierarchyTree) : []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoDateLabel, setPhotoDateLabel] = useState('')
  const [locationName, setLocationName] = useState('')
  const [nodeId, setNodeId] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Populate form once photo loads
  useEffect(() => {
    if (!photo) return
    setTitle(photo.title)
    setDescription(photo.description ?? '')
    setPhotoDateLabel(photo.photoDateLabel ?? '')
    setLocationName(photo.locationName ?? '')
    setNodeId(photo.hierarchyNodeId ?? '')
    setTagsInput(photo.tags.map((t) => t.name).join(', '))
  }, [photo])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Tytuł jest wymagany.'); return }
    setIsSaving(true)
    setError(null)
    try {
      await photosApi.update(id!, {
        title: title.trim(),
        description: description.trim() || undefined,
        photoDateLabel: photoDateLabel.trim() || undefined,
        locationName: locationName.trim() || undefined,
        nodeId: nodeId || undefined,
        tags: tagsInput.trim()
          ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      })
      navigate('/my-collection')
    } catch {
      setError('Nie udało się zapisać zmian. Spróbuj ponownie.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setIsDeleting(true)
    try {
      await photosApi.delete(id!)
      navigate('/my-collection')
    } catch {
      setError('Nie udało się usunąć zdjęcia.')
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
          Nie znaleziono zdjęcia.
        </p>
        <Link to="/my-collection" className="text-sm underline" style={{ color: 'var(--color-primary)' }}>
          Wróć do kolekcji
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link
        to="/my-collection"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Moja kolekcja
      </Link>

      <div className="flex items-start justify-between mb-6">
        <h1
          className="text-2xl font-headline"
          style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
        >
          Edytuj zdjęcie
        </h1>
        {photo.thumbnailUrl && (
          <img
            src={photo.thumbnailUrl}
            alt={photo.title}
            className="w-20 h-16 rounded-lg object-cover"
          />
        )}
      </div>

      <form onSubmit={handleSave} noValidate>
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Tytuł <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-outline)',
                color: 'var(--color-on-surface)',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Opis
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border resize-none"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-outline)',
                color: 'var(--color-on-surface)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="edit-date"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Data (etykieta)
              </label>
              <input
                id="edit-date"
                type="text"
                value={photoDateLabel}
                onChange={(e) => setPhotoDateLabel(e.target.value)}
                placeholder="np. ok. 1954"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-outline)',
                  color: 'var(--color-on-surface)',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="edit-location"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Lokalizacja
              </label>
              <input
                id="edit-location"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-outline)',
                  color: 'var(--color-on-surface)',
                }}
              />
            </div>
          </div>

          {flatNodes.length > 0 && (
            <div>
              <label
                htmlFor="edit-node"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Obszar w hierarchii
              </label>
              <select
                id="edit-node"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-outline)',
                  color: 'var(--color-on-surface)',
                }}
              >
                <option value="">— brak —</option>
                {flatNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {'　'.repeat(n.depth)}{n.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="edit-tags"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Tagi
              <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-on-surface-variant)' }}>
                (oddzielone przecinkami)
              </span>
            </label>
            <input
              id="edit-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="np. Warszawa, XIX wiek, architektura"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-outline)',
                color: 'var(--color-on-surface)',
              }}
            />
          </div>

          {error && (
            <p
              className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              >
                {isSaving ? 'Zapisywanie…' : 'Zapisz zmiany'}
              </button>
              <Link
                to="/my-collection"
                className="px-5 py-2.5 rounded-full text-sm font-medium border"
                style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
              >
                Anuluj
              </Link>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm disabled:opacity-50"
              style={{
                background: confirmDelete ? 'var(--color-error)' : 'transparent',
                color: confirmDelete ? '#fff' : 'var(--color-error)',
                border: `1px solid var(--color-error)`,
              }}
            >
              <Trash2 size={14} aria-hidden="true" />
              {isDeleting ? 'Usuwanie…' : confirmDelete ? 'Potwierdź usunięcie' : 'Usuń'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
