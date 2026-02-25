import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../hooks/useProfile'

const APP_ROUTES = ['/', '/workouts', '/diet', '/bmi', '/meal-photo', '/motivation', '/reminders']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const { onboardingCompleted, lastSeenRoute, loading: profileLoading } = useProfile(user?.id)

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <p className="text-zinc-400">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  // Only redirect to lastSeenRoute when coming from login (resume where they left off)
  // Don't redirect when user explicitly clicks Home - that would break the Home nav
  const fromLogin = location.state?.fromLogin
  const fromPath = location.state?.from?.pathname
  const targetRoute = fromPath && APP_ROUTES.includes(fromPath) ? fromPath : (lastSeenRoute !== '/' ? lastSeenRoute : null)
  if (fromLogin && targetRoute && location.pathname === '/') {
    return <Navigate to={targetRoute} replace state={{}} />
  }

  return <>{children}</>
}
