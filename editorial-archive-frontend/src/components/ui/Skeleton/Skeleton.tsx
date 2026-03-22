import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded', className)}
      style={{ background: 'var(--color-surface-variant)' }}
      aria-hidden="true"
    />
  )
}

export function PhotoCardSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-3 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
