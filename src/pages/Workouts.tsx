import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Barbell, ArrowsClockwise, MapTrifold, CheckCircle, Heartbeat } from '@phosphor-icons/react'
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

  // Timer State
  const [workoutActive, setWorkoutActive] = useState(false)
  const [workoutPaused, setWorkoutPaused] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0) // in seconds

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

  // Timer Hook
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (workoutActive && !workoutPaused) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutActive, workoutPaused]);

  // Timer Controls
  const handleStartWorkout = () => {
    setWorkoutActive(true);
    setWorkoutPaused(false);
  };

  const handlePauseWorkout = () => {
    setWorkoutPaused(true);
  };

  const handleResumeWorkout = () => {
    setWorkoutPaused(false);
  };

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
      setWorkoutActive(false)
      setWorkoutPaused(false)
      setTimeElapsed(0)
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
        <h2 className="font-display text-2xl font-bold text-white tracking-wide">Workouts</h2>
        <p className="text-zinc-500 font-medium">Loading your plan…</p>
      </div>
    )
  }

  const hasPlan = (plan?.workout_plan?.gym_week?.length ?? 0) > 0 || (plan?.workout_plan?.home_week?.length ?? 0) > 0
  if (!hasPlan) {
    return (
      <div className="space-y-6">
        <section>
          <h2 className="font-display text-2xl font-bold text-white tracking-wide">Workouts</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Get a personalized workout plan based on your profile, goals, and activity level.
          </p>
        </section>
        <div className="glass-card p-6">
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
            Complete your profile and we'll generate a custom 7-day workout plan — gym and home options — tailored to you.
          </p>
          {generateError && (
            <p className="text-sm text-red-400 mb-4 flex items-center justify-between bg-red-400/10 px-4 py-3 rounded-xl">
              <span>{generateError}</span>
              <button type="button" onClick={clearError} className="text-zinc-400 hover:text-white font-medium">Dismiss</button>
            </p>
          )}
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            disabled={generating}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 font-bold shadow-lg disabled:opacity-50"
          >
            <ArrowsClockwise className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating your plan…' : 'Generate AI Workout Plan'}
          </button>
        </div>
      </div>
    )
  }

  const dayNames = tab === 'gym' ? gymDayNames : homeDayNames
  const selectedDay = tab === 'gym' ? selectedGymDay : selectedHomeDay
  const setSelectedDay = tab === 'gym' ? setSelectedGymDay : setSelectedHomeDay

  const isCompleted = recentLogs.some(
    (l) => l.date === new Date().toISOString().slice(0, 10) && l.workout_id === workoutToShow?.id && l.completed
  )
  const totalMin = workoutToShow ? parseInt((workoutToShow.duration || "60").replace(/[^\d]/g, '')) : 60

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate remaining time based on active timer elapsed seconds
  const totalSeconds = totalMin * 60
  const secondsLeft = Math.max(0, totalSeconds - timeElapsed)

  const pct = isCompleted ? 1 : workoutActive || timeElapsed > 0 ? timeElapsed / totalSeconds : 0
  const strokeOffset = 210 - (210 * Math.min(1, pct))

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-[28px] font-bold text-white tracking-tight leading-none mb-1.5">Your Activity</h2>
          <p className="text-zinc-500 text-[13px] font-medium">
            {plan?.workout_plan?.split ?? 'Personalized Plan'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <Barbell size={20} className="text-white" />
          </div>
        </div>
      </section>

      {/* Pill Toggles */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setTab('gym')}
          className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === 'gym' ? 'bg-gradient-to-r from-[#ff6b40] to-[#ff3d00] text-white shadow-lg shadow-[#ff3d00]/20' : 'bg-transparent text-zinc-500 hover:text-zinc-300'
            }`}
        >
          Gym Plan
        </button>
        <button
          type="button"
          onClick={() => setTab('home')}
          className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === 'home' ? 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white shadow-lg shadow-[#3b82f6]/20' : 'bg-transparent text-zinc-500 hover:text-zinc-300'
            }`}
        >
          Home Plan
        </button>
        {dayNames.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${selectedDay === day ? 'bg-white/10 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Geo-tracking badge (gym tab only) */}
      {tab === 'gym' && (
        <div className="flex items-center gap-2 text-[11px] font-medium px-2">
          <MapTrifold size={14} weight="fill" className="text-zinc-500" />
          {!geoState.tracking ? (
            <Link to="/app/settings" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Auto-tracking: Off — Set up in Settings
            </Link>
          ) : geoState.autoLogged ? (
            <span className="text-[#84cc16]">Workout auto-logged via location</span>
          ) : geoState.nearGym ? (
            <span className="text-[#3b82f6] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-pulse" />
              Near gym ({Math.floor(geoState.timerSeconds / 60)}/{15} min)
            </span>
          ) : (
            <span className="text-zinc-500">Not near gym</span>
          )}
        </div>
      )}

      {/* Main Activity Card */}
      {workoutToShow && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} weight="fill" className={isCompleted || (isTodayWorkout && geoState.autoLogged) ? "text-[#84cc16]" : "text-zinc-600"} />
              <h2 className="text-[17px] font-bold text-white tracking-wide">
                {isTodayWorkout ? "Today's Workout" : `${workoutToShow.dayLabel} Workout`}
              </h2>
            </div>
            <span className="text-sm font-bold text-[#84cc16] tracking-wide">
              {workoutToShow.exercises.length} <span className="text-zinc-500 text-xs font-semibold">Ex.</span>
            </span>
          </div>

          <div className="flex flex-col items-center justify-center mb-10 relative">
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <div className="text-center">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Elapsed</p>
                <p className="text-[#3b82f6] text-sm font-bold font-mono">{isCompleted ? formatTime(totalSeconds) : formatTime(timeElapsed)}</p>
              </div>
              <div className="text-center">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Left</p>
                <p className="text-[#ffb703] text-sm font-bold font-mono">{isCompleted ? "0:00" : formatTime(secondsLeft)}</p>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-135" viewBox="0 0 100 100">
                <path d="M 20 80 A 45 45 0 1 1 80 80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
                <path
                  d="M 20 80 A 45 45 0 1 1 80 80"
                  fill="none"
                  stroke={tab === 'home' ? '#3b82f6' : '#84cc16'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="210"
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="flex flex-col items-center mt-2">
                <span className="text-3xl font-bold font-mono text-white leading-none tracking-tight">
                  {isCompleted ? "0:00" : formatTime(secondsLeft)}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 mt-2">of {totalMin} min. left</span>
              </div>
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-4">
            {workoutToShow.exercises.map((ex, i) => (
              <div key={i} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl hover:bg-white/[0.04] transition-colors group border border-white/[0.03]">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tab === 'home' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-[#ffb703]/10 text-[#ffb703]'}`}>
                    {i % 2 === 0 ? <Barbell size={20} weight="fill" /> : <Heartbeat size={20} weight="fill" className={tab === 'home' ? '' : 'text-[#ff6b40]'} />}
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-zinc-100">{ex.name}</p>
                    <p className="text-[11px] font-medium text-zinc-500 mt-0.5 truncate max-w-[180px]">
                      {ex.sets} sets × {ex.reps} {ex.rest ? `· ${ex.rest}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white bg-white/5 py-1.5 px-3 rounded-lg">
                    {(() => {
                      const restStr = String(ex.rest || "60s").toLowerCase();
                      const val = parseInt(restStr.replace(/[^\d]/g, '')) || 60;
                      const isSec = restStr.includes('s');
                      const setsStr = String(ex.sets || "3");
                      const sets = parseInt(setsStr.replace(/[^\d]/g, '')) || 3;
                      const restMins = isSec ? (val * sets) / 60 : val * sets;
                      // Estimate 45s active work per set (.75 minutes)
                      const totalMins = Math.ceil(restMins + (sets * 0.75));
                      return `${totalMins} min.`;
                    })()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {isTodayWorkout && (
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              {geoState.autoLogged && tab === 'gym' ? (
                <div className="w-full text-center py-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 font-bold text-[14px]">
                  Workout safely auto-logged
                </div>
              ) : isCompleted ? (
                <div className="w-full text-center py-3.5 rounded-2xl bg-[#84cc16]/10 text-[#84cc16] font-bold text-[14px]">
                  Workout Completed
                </div>
              ) : workoutActive ? (
                <div className="grid grid-cols-2 gap-3">
                  {workoutPaused ? (
                    <button
                      type="button"
                      onClick={handleResumeWorkout}
                      className="w-full py-3.5 rounded-2xl font-bold transition-all shadow-lg text-[14px] tracking-wide bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[#3b82f6]/20"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePauseWorkout}
                      className="w-full py-3.5 rounded-2xl font-bold transition-all shadow-lg text-[14px] tracking-wide bg-zinc-800 hover:bg-zinc-700 text-white shadow-black/20"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogWorkout}
                    disabled={logging}
                    className="w-full py-3.5 rounded-2xl font-bold transition-all shadow-lg text-[14px] tracking-wide bg-[#ff3d00] hover:bg-[#dd3300] text-white shadow-[#ff3d00]/20 disabled:opacity-50"
                  >
                    {logging ? 'Saving…' : 'Stop & Save'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartWorkout}
                  disabled={logging || !!geoState.autoLogged}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-all shadow-lg text-[14px] tracking-wide ${tab === 'home' ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[#3b82f6]/20' : 'bg-[#84cc16] hover:bg-[#65a30d] text-[#0d0f14] shadow-[#84cc16]/20'
                    } disabled:opacity-50`}
                >
                  Start Workout
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
          className="w-full text-[13px] font-medium text-zinc-500 hover:text-white py-2 flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowsClockwise className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Regenerating...' : 'Regenerate workout plan'}
        </button>
      )}
    </div>
  )
}
