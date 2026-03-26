import type { PhotoStatus } from '@/types/photo.types'

const config: Record<PhotoStatus, { label: string; bg: string; color: string }> = {
  APPROVED:          { label: 'Zatwierdzone',    bg: 'var(--color-primary-fixed)',   color: 'var(--color-primary)' },
  PENDING:           { label: 'Oczekuje',         bg: '#fef3c7',                      color: '#92400e' },
  REJECTED:          { label: 'Odrzucone',        bg: 'var(--color-error-container)', color: 'var(--color-error)' },
  NEEDS_CORRECTION:  { label: 'Do poprawy',       bg: '#e0e7ff',                      color: '#3730a3' },
}

export default function PhotoStatusBadge({ status }: { status: PhotoStatus }) {
  const { label, bg, color } = config[status]
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}
