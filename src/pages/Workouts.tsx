import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Dumbbell, Home, Clock, Zap, RefreshCw, MapPin } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { usePlan } from '../hooks/usePlan'
import { useProfile } from '../hooks/useProfile'
import { useGeneratePlan } from '../hooks/useGeneratePlan'
import { useRecentWorkoutLogs } from '../hooks/useRecentWorkoutLogs'
import { useGeoTracking } from '../hooks/useGeoTracking'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabaseClient'
import { getDayName, planDayToWorkout } from '../data/workouts'

export default function Workouts() {
  const { user } = useAuth()
  const { plan, loading: planLoading, refetch: refetchPlan } = usePlan(user?.id)
  const { appProfile } = useProfile(user?.id)
  const { logs: recentLogs } = useRecentWorkoutLogs(user?.id, 14)
  const { generate, loading: generating, error: generateError, clearError } = useGeneratePlan()
  const { profile } = useStore()
  const profileForPlan = appProfile ?? profile
  const [searchParams] = useSearchParams()
  const typeFromUrl = searchParams.get('type')
  const [tab, setTab] = useState<'gym' | 'home'>(typeFromUrl === 'home' ? 'home' : 'gym')
  const { profile: dbProfile } = useProfile(user?.id)
  const geoState = useGeoTracking(
    user?.id,
    dbProfile?.gym_lat,
    dbProfile?.gym_lng,
    dbProfile?.geo_tracking_enabled ?? false,
  )
  const { setLastGymDay } = useStore()
  const todayNum = new Date().getDay()
  const todayDayName = getDayName(todayNum)
  const [selectedGymDay, setSelectedGymDay] = useState<string>(todayDayName)
  const [selectedHomeDay, setSelectedHomeDay] = useState<string>(todayDayName)
  const [logging, setLogging] = useState(false)

  const aiGymDays = useMemo(() => {
    const days = plan?.workout_plan?.gym_week ?? []
    return days.map((d) => planDayToWorkout(d, 'gym', `ai-gym-${d.day_label}`))
  }, [plan])
  const aiHomeDays = useMemo(() => {
    const days = plan?.workout_plan?.home_week ?? []
    return days.map((d) => planDayToWorkout(d, 'home', `ai-home-${d.day_label}`))
  }, [plan])

  const gymDayNames = aiGymDays.map((w) => w.dayLabel)
  const homeDayNames = aiHomeDays.map((w) => w.dayLabel)
  const selectedGymWorkout = aiGymDays.find((w) => w.dayLabel === selectedGymDay) ?? aiGymDays[0]
  const selectedHomeWorkout = aiHomeDays.find((w) => w.dayLabel === selectedHomeDay) ?? aiHomeDays[0]
  const workoutToShow = tab === 'gym' ? selectedGymWorkout : selectedHomeWorkout

  async function handleGenerate(regenerate = false) {
    try {
      await generate(profileForPlan, recentLogs, regenerate)
      await refetchPlan()
    } catch {
      // Error shown by useGeneratePlan
    }
  }

  async function handleLogWorkout() {
    if (!user?.id || !workoutToShow) return
    setLogging(true)
    const today = new Date().toISOString().slice(0, 10)
    try {
      await supabase.from('workout_logs').upsert(
        { user_id: user.id, date: today, workout_id: workoutToShow.id, completed: true },
        { onConflict: 'user_id,date' }
      )
      setLastGymDay(todayNum)
    } finally {
      setLogging(false)
    }
  }

  const isTodayWorkout =
    workoutToShow &&
    ((tab === 'gym' && selectedGymDay === todayDayName) || (tab === 'home' && selectedHomeDay === todayDayName))

  if (planLoading) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-zinc-100">Workouts</h2>
        <p className="text-zinc-400">Loading your plan…</p>
      </div>
    )
  }

  const hasPlan = (plan?.workout_plan?.gym_week?.length ?? 0) > 0 || (plan?.workout_plan?.home_week?.length ?? 0) > 0
  if (!hasPlan) {
    return (
      <div className="space-y-6">
        <section>
          <h2 className="font-display text-2xl font-bold text-zinc-100">Workouts</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Get a personalized workout plan based on your profile, goals, and activity level.
          </p>
        </section>
        <div className="card p-5">
          <p className="text-zinc-400 text-sm mb-4">
            Complete your profile and we'll generate a custom 7-day workout plan — gym and home options — tailored to you.
          </p>
          {generateError && (
            <p className="text-sm text-red-400 mb-2 flex items-center justify-between">
              <span>{generateError}</span>
              <button type="button" onClick={clearError} className="text-zinc-500 hover:text-zinc-300">Dismiss</button>
            </p>
          )}
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            disabled={generating}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating your plan…' : 'Generate my AI workout plan'}
          </button>
        </div>
      </div>
    )
  }

  const dayNames = tab === 'gym' ? gymDayNames : homeDayNames
  const selectedDay = tab === 'gym' ? selectedGymDay : selectedHomeDay
  const setSelectedDay = tab === 'gym' ? setSelectedGymDay : setSelectedHomeDay

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl font-bold text-zinc-100">Workouts</h2>
        <p className="text-zinc-400 text-sm mt-1">
          {tab === 'gym' ? 'Your AI-generated gym plan' : 'Your AI-generated home plan'} · {plan?.workout_plan?.split ?? 'Personalized'}
        </p>
      </section>

      <div className="flex rounded-xl bg-surface-800/60 p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab('gym')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            tab === 'gym' ? 'btn-tab-active' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          Gym
        </button>
        <button
          type="button"
          onClick={() => setTab('home')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            tab === 'home' ? 'btn-tab-active' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5" />
          Home
        </button>
      </div>

      {/* Geo-tracking badge (gym tab only) */}
      {tab === 'gym' && (
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
          {!geoState.tracking ? (
            <Link to="/settings" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Auto-tracking: Off — Set up in Settings
            </Link>
          ) : geoState.autoLogged ? (
            <span className="text-emerald-400">Workout auto-logged via location</span>
          ) : geoState.nearGym ? (
            <span className="text-blue-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Near gym ({Math.floor(geoState.timerSeconds / 60)}/{15} min)
            </span>
          ) : (
            <span className="text-zinc-500">Not near gym</span>
          )}
        </div>
      )}

      {dayNames.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1">
          {dayNames.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`shrink-0 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedDay === day ? 'btn-tab-active' : 'bg-surface-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      {workoutToShow && (
        <div className="card overflow-hidden">
          <div className="flex items-start gap-4 p-5">
            {workoutToShow.imageUrl ? (
              <img src={workoutToShow.imageUrl} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-xl icon-gradient-bg flex items-center justify-center shrink-0">
                {tab === 'gym' ? (
                  <Dumbbell className="w-12 h-12 text-white" />
                ) : (
                  <Home className="w-12 h-12 text-white" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-zinc-100">{workoutToShow.title}</h3>
              <p className="text-sm text-zinc-500 mt-0.5">{workoutToShow.dayLabel}</p>
              <div className="flex items-center gap-3 text-sm text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {workoutToShow.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" /> {workoutToShow.difficulty}
                </span>
              </div>
            </div>
          </div>
          <ul className="space-y-3 px-5 pb-5">
            {workoutToShow.exercises.map((ex, i) => (
              <li key={i} className="flex justify-between items-start gap-4 py-2 border-b border-zinc-700/50 last:border-0">
                <div>
                  <p className="font-medium text-zinc-200">{ex.name}</p>
                  {ex.notes && <p className="text-xs text-zinc-500 mt-0.5">{ex.notes}</p>}
                </div>
                <span className="text-sm text-zinc-400 shrink-0">
                  {ex.sets} × {ex.reps}
                  {ex.rest && ` · ${ex.rest} rest`}
                </span>
              </li>
            ))}
          </ul>
          {isTodayWorkout && (
            <div className="px-5 pb-5">
              {geoState.autoLogged && tab === 'gym' ? (
                <div className="w-full text-center py-2.5 rounded-xl bg-surface-700 text-emerald-400 font-medium text-sm">
                  Workout auto-logged via location
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogWorkout}
                  disabled={logging}
                  className="w-full btn-primary py-2.5 disabled:opacity-50"
                >
                  {logging ? 'Saving…' : 'I did this workout'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {hasPlan && (
        <button
          type="button"
          onClick={() => handleGenerate(true)}
          disabled={generating}
          className="text-sm text-gradient hover:opacity-80 flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Regenerating…' : 'Regenerate workout plan'}
        </button>
      )}
    </div>
  )
}
