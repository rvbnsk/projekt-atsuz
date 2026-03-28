import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users.api'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import type { UserResponse } from '@/types/admin.types'

const ROLE_OPTIONS = ['VIEWER', 'CREATOR', 'ADMIN']

const ROLE_LABELS: Record<string, string> = {
  VIEWER: 'Widz',
  CREATOR: 'Twórca',
  ADMIN: 'Admin',
}

function UserRow({ user, onBlock, onRoleChange }: {
  user: UserResponse
  onBlock: (id: string, blocked: boolean) => void
  onRoleChange: (id: string, role: string) => void
}) {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-outline)' }}>
      <td className="py-3 pr-4">
        <div className="font-medium text-sm" style={{ color: 'var(--color-on-surface)' }}>
          {user.displayName}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
          {user.email}
        </div>
      </td>
      <td className="py-3 pr-4">
        <select
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value)}
          className="px-2 py-1 rounded-lg text-sm border outline-none"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-outline)',
            color: 'var(--color-on-surface)',
          }}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </td>
      <td className="py-3 pr-4">
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-medium"
          style={{
            background: user.isBlocked ? 'var(--color-error-container)' : 'var(--color-primary-fixed)',
            color: user.isBlocked ? 'var(--color-error)' : 'var(--color-primary)',
          }}
        >
          {user.isBlocked ? 'Zablokowany' : 'Aktywny'}
        </span>
      </td>
      <td className="py-3">
        <button
          onClick={() => onBlock(user.id, !user.isBlocked)}
          className="px-3 py-1.5 rounded-full text-sm border"
          style={{
            borderColor: user.isBlocked ? 'var(--color-primary)' : 'var(--color-error)',
            color: user.isBlocked ? 'var(--color-primary)' : 'var(--color-error)',
          }}
        >
          {user.isBlocked ? 'Odblokuj' : 'Zablokuj'}
        </button>
      </td>
    </tr>
  )
}

export default function UserManagementPage() {
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => usersApi.list({ page, size: 20 }),
  })

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      usersApi.block(id, blocked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      usersApi.changeRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const users = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-headline"
          style={{ fontFamily: 'var(--font-headline)', color: 'var(--color-on-surface)' }}
        >
          Użytkownicy
        </h1>
        {data && (
          <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {data.pagination.totalElements} kont
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm py-12 text-center" style={{ color: 'var(--color-on-surface-variant)' }}>
          Brak użytkowników.
        </p>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-outline)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-variant)' }}>
                {['Użytkownik', 'Rola', 'Status', 'Akcja'].map((h) => (
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
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onBlock={(id, blocked) => blockMutation.mutate({ id, blocked })}
                  onRoleChange={(id, role) => roleMutation.mutate({ id, role })}
                />
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
