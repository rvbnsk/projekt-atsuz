import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import type { Photo } from '@/types/photo.types'
import { Calendar, MapPin } from 'lucide-react'

// Custom divIcon avoids Vite bundler issues with leaflet's default images
const photoIcon = L.divIcon({
  className: '',
  html: `<div
    style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:var(--color-primary,#012d1e);
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
    "
  >
    <span style="transform:rotate(45deg);font-size:13px">📷</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
})

/** Auto-fit bounds when photos change */
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }, [positions, map])
  return null
}

interface ArchiveMapProps {
  photos: Photo[]
  height?: string
  /** if false, skip the FitBounds auto-zoom (useful when user controls the view) */
  autoFit?: boolean
}

export default function ArchiveMap({
  photos,
  height = '500px',
  autoFit = true,
}: ArchiveMapProps) {
  const geoPhotos = useMemo(
    () =>
      photos.filter(
        (p) => p.latitude != null && p.longitude != null,
      ) as (Photo & { latitude: number; longitude: number })[],
    [photos],
  )

  const positions = useMemo<[number, number][]>(
    () => geoPhotos.map((p) => [p.latitude, p.longitude]),
    [geoPhotos],
  )

  const center: [number, number] = positions.length > 0 ? positions[0] : [52.0, 19.0]

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={positions.length === 0 ? 6 : 5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {autoFit && positions.length > 0 && <FitBounds positions={positions} />}

        {geoPhotos.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.latitude, photo.longitude]}
            icon={photoIcon}
          >
            <Popup maxWidth={220}>
              <div className="text-sm" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
                {photo.thumbnailUrl && (
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    className="w-full h-28 object-cover rounded mb-2"
                  />
                )}
                <p className="font-semibold leading-snug mb-1 text-gray-900 line-clamp-2">
                  {photo.title}
                </p>
                <div className="flex flex-col gap-0.5 text-xs text-gray-500 mb-2">
                  {(photo.photoDateLabel ?? photo.photoDateFrom) && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {photo.photoDateLabel ?? photo.photoDateFrom?.slice(0, 4)}
                    </span>
                  )}
                  {photo.locationName && (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {photo.locationName}
                    </span>
                  )}
                </div>
                <Link
                  to={`/photos/${photo.id}`}
                  className="text-xs font-medium underline"
                  style={{ color: 'var(--color-primary, #012d1e)' }}
                >
                  Zobacz zdjęcie →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
