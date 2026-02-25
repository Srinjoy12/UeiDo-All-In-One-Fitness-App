import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Dumbbell, Camera, Scale, MoreHorizontal, Utensils, Sparkles, Bell, LogOut, X, Settings } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../hooks/useProfile'
import { useReminders } from '../hooks/useReminders'
import { useGeoTracking } from '../hooks/useGeoTracking'
import { useTheme } from '../hooks/useTheme'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabaseClient'

const primaryNav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workouts', icon: Dumbbell, label: 'Plan' },
  { to: '/meal-photo', icon: Camera, label: 'Log' },
  { to: '/bmi', icon: Scale, label: 'Profile' },
]

const moreNav = [
  { to: '/diet', icon: Utensils, label: 'Diet' },
  { to: '/motivation', icon: Sparkles, label: 'Motivation' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const APP_ROUTES = ['/', '/workouts', '/diet', '/bmi', '/meal-photo', '/motivation', '/reminders', '/settings']

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { appProfile, profile: dbProfile } = useProfile(user?.id)
  useReminders(user?.id)
  useTheme()
  useGeoTracking(
    user?.id,
    dbProfile?.gym_lat,
    dbProfile?.gym_lng,
    dbProfile?.geo_tracking_enabled ?? false,
  )
  const setProfile = useStore((s) => s.setProfile)
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreRoute = ['/diet', '/motivation', '/reminders', '/settings'].includes(location.pathname)

  useEffect(() => {
    if (appProfile) setProfile(appProfile)
  }, [appProfile])

  useEffect(() => {
    if (!user?.id || !APP_ROUTES.includes(location.pathname)) return
    supabase
      .from('profiles')
      .update({ last_seen_route: location.pathname })
      .eq('user_id', user.id)
      .then(() => {})
  }, [user?.id, location.pathname])

  function handleMoreLink(to: string) {
    navigate(to)
    setMoreOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <header className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-gradient">UeiDo</h1>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-sm hidden sm:inline">All-in-One Fitness</span>
            <button
              type="button"
              onClick={() => signOut()}
              className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-900/95 backdrop-blur border-t border-zinc-800/50 safe-area-pb">
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          {primaryNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'nav-active' : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${
              isMoreRoute ? 'nav-active' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="More"
          >
            <MoreHorizontal className="w-6 h-6" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-50 card p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-zinc-100">More</h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {moreNav.map(({ to, icon: Icon, label }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => handleMoreLink(to)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === to
                      ? 'nav-active'
                      : 'text-zinc-300 hover:bg-surface-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
