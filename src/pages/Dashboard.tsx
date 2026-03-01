import { Link } from 'react-router-dom'
import {
  Flame,
  Target,
  Heartbeat,
  Barbell,
  Play,
  Clock,
  CaretRight,
  Lightning
} from '@phosphor-icons/react'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../hooks/useProfile'
import { useGeneratePlan } from '../hooks/useGeneratePlan'
import { useWorkoutLogToday } from '../hooks/useWorkoutLogToday'
import { useRecentWorkoutLogs } from '../hooks/useRecentWorkoutLogs'
import { useMealLogs } from '../hooks/useMealLogs'
import { useStore } from '../store/useStore'
import { usePlan } from '../hooks/usePlan'
import { getTodayWorkoutsFromPlan } from '../data/workouts'
import { computeBMI, getBMICategory, calorieTarget } from '../lib/bmi'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard() {
  const { user } = useAuth()
  const { plan } = usePlan(user?.id)
  const { appProfile } = useProfile(user?.id)
  const { didWorkoutToday } = useWorkoutLogToday(user?.id)
  const { logs: recentLogs, streak } = useRecentWorkoutLogs(user?.id, 365)
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().slice(0, 10)
  const weekLogs = recentLogs.filter((l) => l.completed && l.date >= weekStartStr)
  const { generate, loading: generating, error: generateError, clearError } = useGeneratePlan()
  const { profile } = useStore()
  const profileForPlan = appProfile ?? profile
  const { gymToday, homeToday } = getTodayWorkoutsFromPlan(plan)
  const showGym = !didWorkoutToday
  const bmi = profile.heightCm && profile.weightKg
    ? computeBMI(profile.weightKg, profile.heightCm)
    : 0
  const category = bmi ? getBMICategory(bmi) : '—'
  const { target: calorieTargetVal } = profile.heightCm && profile.weightKg
    ? calorieTarget(profile)
    : { target: 0 }
  const { dailyTotals } = useMealLogs(user?.id)

  const todayIdx = (new Date().getDay() + 6) % 7
  const workoutToShow = showGym && gymToday ? gymToday : homeToday

  const todayDateStr = new Date().getDate();

  return (
    <div className="space-y-8 pb-8">
      {/* Top Widget / Horizon picker */}
      <div className="flex items-center justify-between gap-4">
        <div className="glass-card flex items-center gap-2 py-2 px-4 shrink-0 shadow-lg shadow-black/20">
          <Lightning size={16} weight="fill" className={streak > 0 ? "text-[#ff6b40]" : "text-zinc-500"} />
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-white leading-tight">{streak}</span>
            <span className="text-[9px] text-zinc-500 font-medium uppercase leading-tight">{streak === 1 ? 'Strike' : 'Strikes'}</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-between overflow-x-auto scrollbar-hide gap-3">
          <div className="flex items-center gap-2 bg-[#84cc16]/10 py-1.5 px-3 rounded-full shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#84cc16] flex items-center justify-center text-[#0d0f14] font-bold text-xs">
              {DAYS[todayIdx]}
            </div>
            <span className="text-xs font-medium text-white pr-1">Time to workout</span>
          </div>

          <div className="flex items-center gap-4 shrink-0 px-2 opacity-60">
            {[1, 2, 3].map((offset) => {
              const idx = (todayIdx + offset) % 7;
              return (
                <div key={offset} className="flex flex-col items-center">
                  <span className="text-xs font-bold text-white mb-0.5">{todayDateStr + offset}</span>
                  <span className="text-[10px] text-zinc-500">{DAYS[idx]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 tracking-wide">Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Calories Card */}
          <Link to="/app/bmi" className="glass-card p-5 group hover:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-zinc-400">Calories</span>
              <Flame size={18} weight="fill" className="text-[#ffb703] opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-[#ffb703]">
              {Math.round(dailyTotals.calories)} <span className="text-sm font-medium text-zinc-500 tracking-normal">Kcal</span>
            </p>
          </Link>

          {/* Target Card */}
          <Link to="/app/bmi" className="glass-card p-5 group hover:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-zinc-400">Target Goal</span>
              <Target size={18} weight="fill" className="text-zinc-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-white">
              {calorieTargetVal || '—'} <span className="text-sm font-medium text-zinc-500 tracking-normal">Kcal</span>
            </p>
          </Link>

          {/* BMI Card */}
          <Link to="/app/bmi" className="glass-card p-5 group hover:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-zinc-400">Curr. BMI</span>
              <Heartbeat size={18} weight="fill" className="text-[#ff6b40] opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-[#ff6b40]">
              {bmi ? bmi.toFixed(1) : '—'} <span className="text-sm font-medium text-[#ff6b40]/60 tracking-normal">{category}</span>
            </p>
          </Link>

          {/* Workouts Card */}
          <div className="glass-card p-5 group hover:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-zinc-400">Workouts</span>
              <Barbell size={18} weight="fill" className="text-[#84cc16] opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-white">
              {weekLogs.length} <span className="text-[#84cc16] font-medium">/ 7</span>
            </p>
          </div>
        </div>
      </div>

      {/* Today's Workout Card */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white tracking-wide">Today's Workout</h2>
          <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center">
            <span className="text-[#ffb703] text-xl leading-none">★</span>
          </div>
        </div>

        {(plan?.workout_plan?.gym_week?.length || plan?.workout_plan?.home_week?.length) && workoutToShow ? (
          <Link to={showGym && gymToday ? '/app/workouts?type=gym' : '/app/workouts?type=home'} className="block">
            <div className="glass-card overflow-hidden relative min-h-[220px] p-6 flex flex-col justify-between group">
              {workoutToShow.imageUrl ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent z-10" />
                  <img
                    src={workoutToShow.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-right opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#151821] to-[#0d0f14] z-10" />
              )}

              <div className="relative z-20 flex-1 flex flex-col items-start justify-center">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-4">
                  <span className="text-xs text-zinc-300 font-medium tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                    {workoutToShow.difficulty || 'Advanced'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-3xl leading-none mb-4 w-[60%] drop-shadow-lg">
                  {workoutToShow.title || 'Full Body Workout'}
                </h3>

                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ff6b40] to-[#ff3d00] flex items-center justify-center shadow-[0_0_20px_rgba(255,61,0,0.5)] cursor-pointer hover:scale-110 transition-transform mb-6">
                  <Play size={24} weight="fill" className="text-white ml-1" />
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Flame size={14} className="text-[#ff6b40]" />
                    {(workoutToShow as any).energy || '~1800 Kcal'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#3b82f6]" />
                    {workoutToShow.duration || '60 min'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Link to="/app/workouts" className="glass-card block p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-lg">Generate workout plan</h3>
                <p className="text-sm text-zinc-500 mt-1">Complete setup to get your AI plan</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <CaretRight size={20} weight="bold" className="text-[#ff6b40]" />
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="pt-4">
        {generateError && (
          <p className="text-sm text-red-400 mb-3 flex items-center justify-between bg-red-400/10 px-4 py-3 rounded-xl">
            <span>{generateError}</span>
            <button type="button" onClick={clearError} className="text-zinc-400 hover:text-white font-medium">Dismiss</button>
          </p>
        )}
        <button
          type="button"
          onClick={() => generate(profileForPlan, recentLogs, true).then(() => window.location.reload()).catch(() => { })}
          disabled={generating}
          className="w-full btn-secondary flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold shadow-lg disabled:opacity-50 text-[15px] tracking-wide"
        >
          {generating ? 'Generating…' : 'Regenerate AI Plan'}
        </button>
      </div>
    </div>
  )
}
