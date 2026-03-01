import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  House,
  Barbell,
  Notebook,
  ChartBar,
  User,
  DotsThree,
  Bell,
  X,
} from '@phosphor-icons/react'
import { Sparkle, Bell as BellIcon } from '@phosphor-icons/react'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../hooks/useProfile'
import { useReminders } from '../hooks/useReminders'
import { useGeoTracking } from '../hooks/useGeoTracking'
import { useTheme } from '../hooks/useTheme'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabaseClient'

const primaryNav = [
  { to: '/app', icon: House, label: 'Home' },
  { to: '/app/workouts', icon: Barbell, label: 'Workout' },
  { to: '/app/diet', icon: Notebook, label: 'Diet Plan' },
  { to: '/app/settings', icon: User, label: 'Profile' },
]

const moreNav = [
  { to: '/app/meal-photo', icon: Notebook, label: 'Log Meal Photo' },
  { to: '/app/motivation', icon: Sparkle, label: 'Motivation' },
  { to: '/app/reminders', icon: BellIcon, label: 'Reminders' },
  { to: '/app/bmi', icon: ChartBar, label: 'Statistics' },
]

const APP_ROUTES = ['/app', '/app/workouts', '/app/diet', '/app/bmi', '/app/meal-photo', '/app/motivation', '/app/reminders', '/app/settings']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Layout() {
  const { user } = useAuth()
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

  const isMoreRoute = ['/app/meal-photo', '/app/motivation', '/app/reminders', '/app/bmi'].includes(location.pathname)
  const firstName = appProfile?.name?.split(' ')[0] || 'there'

  useEffect(() => {
    if (appProfile) setProfile(appProfile)
  }, [appProfile])

  useEffect(() => {
    if (!user?.id || !APP_ROUTES.includes(location.pathname)) return
    supabase
      .from('profiles')
      .update({ last_seen_route: location.pathname })
      .eq('user_id', user.id)
      .then(() => { })
  }, [user?.id, location.pathname])

  function handleMoreLink(to: string) {
    navigate(to)
    setMoreOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col pb-28">
      <header className="sticky top-0 z-10 bg-transparent pt-4">
        <div className="max-w-lg mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <span className="text-[#ff6b40] font-medium text-lg">U</span>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">{getGreeting()}</p>
              <h1 className="font-semibold text-white text-lg leading-tight">{firstName} {appProfile?.name?.split(' ')[1] || ''}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-2.5 text-zinc-400 hover:text-white rounded-xl transition-all hover:bg-white/5 relative"
              aria-label="Notifications"
            >
              <Bell size={24} weight="regular" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff6b40] rounded-full border border-[#0d0f14]"></span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/settings')}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff6b40] to-[#ff3d00] p-0.5 flex items-center justify-center"
              aria-label="Profile"
            >
              <div className="w-full h-full rounded-full bg-[#151821] overflow-hidden flex items-center justify-center border-2 border-[#151821]">
                <User size={18} weight="fill" className="text-zinc-400" />
              </div>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname === '/app' ? 'app-index' : location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-4 z-40">
        <div className="glass-card rounded-[32px] flex justify-around items-center py-2 px-3 gap-1 shadow-2xl shadow-black/50 border border-white/10 backdrop-blur-2xl bg-[#121212]/80">
          {primaryNav.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to || (to === '/app' && location.pathname === '/app')
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 min-w-[70px] py-2.5 px-3 rounded-full transition-all duration-300 ${isActive ? 'nav-pill-active' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <Icon size={24} weight={isActive ? "fill" : "regular"} className="shrink-0" />
                <span className="text-[10px] font-medium hidden sm:block">{label}</span>
              </NavLink>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-1 min-w-[70px] py-2.5 px-3 rounded-full transition-all duration-300 ${isMoreRoute ? 'nav-pill-active' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            aria-label="More"
          >
            <DotsThree size={24} weight={isMoreRoute ? "bold" : "regular"} className="shrink-0" />
            <span className="text-[10px] font-medium hidden sm:block">More</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
              onClick={() => setMoreOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto z-50 rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.08]"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white text-lg">More</h3>
                  <button
                    type="button"
                    onClick={() => setMoreOpen(false)}
                    className="p-2 text-zinc-500 hover:text-white rounded-xl"
                    aria-label="Close"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {moreNav.map(({ to, icon: Icon, label }) => (
                    <button
                      key={to}
                      type="button"
                      onClick={() => handleMoreLink(to)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${location.pathname === to
                        ? 'bg-[#ff3d00]/15 text-[#ff3d00]'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <Icon size={20} weight="regular" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
