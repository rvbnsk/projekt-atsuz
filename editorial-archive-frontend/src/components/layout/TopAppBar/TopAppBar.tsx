import { NavLink, Link, useNavigate } from 'react-router-dom'
import { LogOut, Upload, LayoutDashboard, Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth.api'
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle'
import { cn } from '@/utils/cn'

const navLinks = [
  { to: '/',        label: 'Strona główna', exact: true },
  { to: '/explore', label: 'Przeglądaj' },
  { to: '/search',  label: 'Szukaj' },
]

export default function TopAppBar() {
  const { user, isAuthenticated, refreshToken, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* ignoruj */ }
    }
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-surface-variant)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="font-headline text-lg font-semibold shrink-0"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-headline)' }}
        >
          The Editorial Archive
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Nawigacja główna" className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'hover:bg-[var(--color-surface-variant)]',
                )
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-primary)' : undefined,
                color: isActive ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {(user.role === 'CREATOR' || user.role === 'ADMIN') && (
                  <Link
                    to="/upload"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    <Upload size={14} />
                    Prześlij
                  </Link>
                )}
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                  aria-label={user.role === 'ADMIN' ? 'Panel admina' : 'Dashboard'}
                >
                  {user.role === 'ADMIN' ? <Shield size={16} /> : <LayoutDashboard size={16} />}
                  <span className="max-w-[120px] truncate">{user.displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Wyloguj się"
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-[var(--color-surface-variant)]"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ color: 'var(--color-on-surface)' }}
                >
                  Zaloguj
                </Link>
                <Link
                  to="/auth/register"
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                >
                  Rejestracja
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full"
            aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(v => !v)}
            style={{ color: 'var(--color-on-surface)' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Menu mobilne"
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-surface-variant)',
          }}
        >
          {navLinks.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn('px-3 py-2 rounded-lg text-sm font-medium', isActive && 'font-semibold')
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-primary-fixed)' : undefined,
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)',
              })}
            >
              {label}
            </NavLink>
          ))}

          <div className="border-t mt-1 pt-2" style={{ borderColor: 'var(--color-surface-variant)' }}>
            {isAuthenticated && user ? (
              <>
                {(user.role === 'CREATOR' || user.role === 'ADMIN') && (
                  <Link
                    to="/upload"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <Upload size={16} /> Prześlij zdjęcie
                  </Link>
                )}
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  {user.role === 'ADMIN' ? <Shield size={16} /> : <LayoutDashboard size={16} />}
                  {user.displayName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full text-left"
                  style={{ color: 'var(--color-error)' }}
                >
                  <LogOut size={16} /> Wyloguj się
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 rounded-full text-sm font-medium border"
                  style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)' }}
                >
                  Zaloguj
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 rounded-full text-sm font-medium"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                >
                  Rejestracja
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
