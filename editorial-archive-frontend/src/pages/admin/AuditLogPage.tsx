import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import type { AuditLog } from '@/types/admin.types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function AuditLogPage() {
  const [page, setPage] = useState(0)
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', page, actionFilter],
    queryFn: () =>
      adminApi.getAuditLog({
        page,
        size: 50,
        action: actionFilter || undefined,
      }),
  })

  const logs = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1
          className="text-2xl font-headline"
          style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
        >
          Log audytu
        </h1>
        {data && (
          <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {data.pagination.totalElements} wpisów
          </span>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtruj po akcji (np. PHOTO_APPROVED)"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 rounded-lg text-sm border outline-none w-full sm:w-72"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-outline)',
            color: 'var(--color-on-surface)',
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm py-12 text-center" style={{ color: 'var(--color-on-surface-variant)' }}>
          Brak wpisów w logu.
        </p>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-outline)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-variant)' }}>
                {['Data', 'Akcja', 'Cel', 'Aktor'].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-4 text-xs font-medium"
                    style={{ color: 'var(--color-on-surface-variant)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--color-surface)' }}>
              {logs.map((log: AuditLog) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-outline)' }}>
                  <td
                    className="py-2.5 px-4 text-xs whitespace-nowrap"
                    style={{ color: 'var(--color-on-surface-variant)' }}
                  >
                    {formatDate(log.createdAt)}
                  </td>
                  <td
                    className="py-2.5 px-4 text-sm font-mono"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    {log.action}
                  </td>
                  <td
                    className="py-2.5 px-4 text-xs"
                    style={{ color: 'var(--color-on-surface-variant)' }}
                  >
                    {log.targetType ? `${log.targetType}` : '—'}
                    {log.targetId ? ` · ${log.targetId.slice(0, 8)}…` : ''}
                  </td>
                  <td
                    className="py-2.5 px-4 text-xs"
                    style={{ color: 'var(--color-on-surface-variant)' }}
                  >
                    {log.actorId ? log.actorId.slice(0, 8) + '…' : 'system'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-full text-sm disabled:opacity-40"
            style={{ background: 'var(--color-surface-variant)', color: 'var(--color-on-surface)' }}
          >
            Wstecz
          </button>
          <span className="px-4 py-2 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-full text-sm disabled:opacity-40"
            style={{ background: 'var(--color-surface-variant)', color: 'var(--color-on-surface)' }}
          >
            Dalej
          </button>
        </div>
      )}
    </div>
  )
}
