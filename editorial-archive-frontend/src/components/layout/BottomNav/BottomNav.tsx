import { NavLink } from 'react-router-dom'
import { Home, Compass, Search, Map, Upload, LayoutDashboard, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

export default function BottomNav() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <nav
      aria-label="Nawigacja mobilna"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t flex"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-surface-variant)',
      }}
    >
      <NavLink
        to="/"
        end
        aria-label="Strona główna"
        className={({ isActive }) =>
          cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors', isActive && 'font-semibold')
        }
        style={({ isActive }) => ({
          color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
        })}
      >
        <Home size={20} aria-hidden="true" />
        <span>Główna</span>
      </NavLink>

      <NavLink
        to="/explore"
        aria-label="Przeglądaj"
        className={({ isActive }) =>
          cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors', isActive && 'font-semibold')
        }
        style={({ isActive }) => ({
          color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
        })}
      >
        <Compass size={20} aria-hidden="true" />
        <span>Przeglądaj</span>
      </NavLink>

      <NavLink
        to="/search"
        aria-label="Szukaj"
        className={({ isActive }) =>
          cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors', isActive && 'font-semibold')
        }
        style={({ isActive }) => ({
          color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
        })}
      >
        <Search size={20} aria-hidden="true" />
        <span>Szukaj</span>
      </NavLink>

      <NavLink
        to="/map"
        aria-label="Mapa"
        className={({ isActive }) =>
          cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors', isActive && 'font-semibold')
        }
        style={({ isActive }) => ({
          color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
        })}
      >
        <Map size={20} aria-hidden="true" />
        <span>Mapa</span>
      </NavLink>

      {isAuthenticated && user ? (
        <>
          {(user.role === 'CREATOR' || user.role === 'ADMIN') && (
            <NavLink
              to="/upload"
              aria-label="Prześlij"
              className={({ isActive }) =>
                cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors', isActive && 'font-semibold')
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              })}
            >
              <Upload size={20} aria-hidden="true" />
              <span>Prześlij</span>
            </NavLink>
          )}
          <NavLink
            to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
            aria-label={user.role === 'ADMIN' ? 'Admin' : 'Panel'}
            className={({ isActive }) =>
              cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors', isActive && 'font-semibold')
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            })}
          >
            {user.role === 'ADMIN' ? <Shield size={20} aria-hidden="true" /> : <LayoutDashboard size={20} aria-hidden="true" />}
            <span>{user.role === 'ADMIN' ? 'Admin' : 'Panel'}</span>
          </NavLink>
        </>
      ) : null}
    </nav>
  )
}
