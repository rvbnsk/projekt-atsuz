import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Image } from 'lucide-react'
import { photosApi } from '@/api/photos.api'
import { useHierarchyTree } from '@/hooks/useHierarchy'
import type { HierarchyNode } from '@/types/hierarchy.types'

/** Flatten hierarchy tree into a list with indentation level */
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

export default function UploadPage() {
  const navigate = useNavigate()
  const { data: hierarchyTree } = useHierarchyTree()
  const flatNodes = hierarchyTree ? flattenNodes(hierarchyTree) : []

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoDateLabel, setPhotoDateLabel] = useState('')
  const [photoDateFrom, setPhotoDateFrom] = useState('')
  const [photoDateTo, setPhotoDateTo] = useState('')
  const [locationName, setLocationName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [rightsStatement, setRightsStatement] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [nodeId, setNodeId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return
    setFile(accepted[0])
    setPreview(URL.createObjectURL(accepted[0]))
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/tiff': [] },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0]
      setError(err?.code === 'file-too-large' ? 'Plik jest zbyt duży (max 50 MB).' : 'Nieobsługiwany format pliku.')
    },
  })

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Wybierz plik zdjęcia.'); return }
    if (!title.trim()) { setError('Tytuł jest wymagany.'); return }

    setIsSubmitting(true)
    setError(null)
    try {
      await photosApi.upload(file, {
        title: title.trim(),
        description: description.trim() || undefined,
        photoDateLabel: photoDateLabel.trim() || undefined,
        photoDateFrom: photoDateFrom || undefined,
        photoDateTo: photoDateTo || undefined,
        locationName: locationName.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        rightsStatement: rightsStatement.trim() || undefined,
        nodeId: nodeId || undefined,
        tags: tagsInput.trim()
          ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
      })
      navigate('/my-collection')
    } catch {
      setError('Wystąpił błąd podczas przesyłania. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1
        className="text-2xl font-headline mb-6"
        style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
      >
        Prześlij zdjęcie
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        {/* Dropzone */}
        {!file ? (
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors mb-5"
            style={{
              borderColor: isDragActive ? 'var(--color-primary)' : 'var(--color-outline)',
              background: isDragActive ? 'var(--color-primary-fixed)' : 'var(--color-surface)',
            }}
          >
            <input {...getInputProps()} aria-label="Wybierz plik zdjęcia" />
            <Image size={36} style={{ color: 'var(--color-on-surface-variant)' }} aria-hidden="true" />
            <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
              {isDragActive ? 'Upuść zdjęcie tutaj' : 'Przeciągnij zdjęcie lub kliknij, aby wybrać'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
              JPG, PNG, WebP, TIFF · max 50 MB
            </p>
          </div>
        ) : (
          <div
            className="relative rounded-xl overflow-hidden mb-5"
            style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
          >
            {preview && (
              <img
                src={preview}
                alt="Podgląd"
                className="w-full max-h-56 object-contain"
              />
            )}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderTop: '1px solid var(--color-surface-variant)' }}
            >
              <span className="text-sm truncate" style={{ color: 'var(--color-on-surface-variant)' }}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </span>
              <button
                type="button"
                onClick={removeFile}
                aria-label="Usuń wybrany plik"
                className="ml-2 p-1 rounded-full hover:bg-[var(--color-surface-variant)]"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Tytuł <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="np. Rynek Starego Miasta, Warszawa"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border focus:ring-2"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-outline)',
                color: 'var(--color-on-surface)',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Opis
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Krótki opis zdjęcia…"
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
                htmlFor="date-label"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Data (etykieta)
              </label>
              <input
                id="date-label"
                type="text"
                value={photoDateLabel}
                onChange={(e) => setPhotoDateLabel(e.target.value)}
                placeholder="np. ok. 1954, lata 60."
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
                htmlFor="location-name"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Lokalizacja
              </label>
              <input
                id="location-name"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="np. ul. Krakowskie Przedmieście"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-outline)',
                  color: 'var(--color-on-surface)',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="date-from"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Data od
              </label>
              <input
                id="date-from"
                type="date"
                value={photoDateFrom}
                onChange={(e) => setPhotoDateFrom(e.target.value)}
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
                htmlFor="date-to"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Data do
              </label>
              <input
                id="date-to"
                type="date"
                value={photoDateTo}
                onChange={(e) => setPhotoDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-outline)',
                  color: 'var(--color-on-surface)',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="latitude"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Szerokość geogr.
              </label>
              <input
                id="latitude"
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="np. 52.2297"
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
                htmlFor="longitude"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Długość geogr.
              </label>
              <input
                id="longitude"
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="np. 21.0122"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-outline)',
                  color: 'var(--color-on-surface)',
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Tagi
              <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-on-surface-variant)' }}>
                (oddzielone przecinkami)
              </span>
            </label>
            <input
              id="tags"
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

          <div>
            <label
              htmlFor="rights"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Prawa / licencja
            </label>
            <input
              id="rights"
              type="text"
              value={rightsStatement}
              onChange={(e) => setRightsStatement(e.target.value)}
              placeholder="np. Domena publiczna, CC BY 4.0"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-outline)',
                color: 'var(--color-on-surface)',
              }}
            />
          </div>

          {flatNodes.length > 0 && (
            <div>
              <label
                htmlFor="node-id"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Obszar w hierarchii
              </label>
              <select
                id="node-id"
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

          {error && (
            <p
              className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-50 transition-opacity"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              <Upload size={14} aria-hidden="true" />
              {isSubmitting ? 'Przesyłanie…' : 'Prześlij zdjęcie'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-full text-sm font-medium border"
              style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
            >
              Anuluj
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
