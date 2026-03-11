import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { lazy, Suspense } from 'react'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const ExplorePage = lazy(() => import('@/pages/ExplorePage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const PhotoDetailPage = lazy(() => import('@/pages/PhotoDetailPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/creator/DashboardPage'))
const UploadPage = lazy(() => import('@/pages/creator/UploadPage'))
const MyCollectionPage = lazy(() => import('@/pages/creator/MyCollectionPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const ModerationPage = lazy(() => import('@/pages/admin/ModerationPage'))

// Protected Route component
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: string[]
}) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Page loading fallback
function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-background)' }}
    >
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{
          borderColor: 'var(--color-surface-variant)',
          borderTopColor: 'var(--color-primary)',
        }}
        aria-label="Ładowanie strony"
        role="status"
      />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Publiczne */}
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/:nodeId" element={<ExplorePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/photos/:id" element={<PhotoDetailPage />} />

        {/* Auth */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Creator */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-collection"
          element={
            <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
              <MyCollectionPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ModerationPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
