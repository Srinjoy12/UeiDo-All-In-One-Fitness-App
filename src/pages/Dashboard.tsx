import { Link } from 'react-router-dom'
import { Dumbbell, Home, Scale, Flame, ChevronRight, RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
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

export default function Dashboard() {
  const { user } = useAuth()
  const { plan } = usePlan(user?.id)
  const { appProfile } = useProfile(user?.id)
  const { didWorkoutToday } = useWorkoutLogToday(user?.id)
  const { logs: recentLogs } = useRecentWorkoutLogs(user?.id, 14)
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
  const { target: calorieTargetVal, burnTarget } = profile.heightCm && profile.weightKg
    ? calorieTarget(profile)
    : { target: 0, burnTarget: 0 }
  const { dailyTotals } = useMealLogs(user?.id)
  const planCalTarget = (plan?.calorie_targets as Record<string, number> | undefined)?.target ?? 0

  const firstName = profile.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl font-bold text-zinc-100 mb-1">
          Hey, {firstName} 👋
        </h2>
        <p className="text-zinc-400">
          {showGym ? "Here's your daily gym plan." : "No gym today? Do a home workout."}
        </p>
      </section>

      {(plan?.workout_plan?.gym_week?.length || plan?.workout_plan?.home_week?.length) ? (
        showGym && gymToday ? (
          <Link
            to="/workouts?type=gym"
            className="card block overflow-hidden transition-all duration-200"
          >
            <div className="flex items-start gap-4 p-5">
              {gymToday.imageUrl ? (
                <img src={gymToday.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl icon-gradient-bg flex items-center justify-center shrink-0">
                  <Dumbbell className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-100">Today's Gym Workout</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{gymToday.title}</p>
                <p className="text-xs text-gradient mt-1">{gymToday.duration}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0 mt-1" />
            </div>
          </Link>
        ) : homeToday ? (
          <Link
            to="/workouts?type=home"
            className="card block overflow-hidden transition-all duration-200"
          >
            <div className="flex items-start gap-4 p-5">
              {homeToday.imageUrl ? (
                <img src={homeToday.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl icon-gradient-bg flex items-center justify-center shrink-0">
                  <Home className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-100">Today's Home Workout</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{homeToday.title}</p>
                <p className="text-xs text-gradient mt-1">{homeToday.duration}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0 mt-1" />
            </div>
          </Link>
        ) : (
          <Link
            to="/workouts"
            className="card block overflow-hidden transition-all duration-200 p-5"
          >
            <h3 className="font-semibold text-zinc-100">View Workout Plan</h3>
            <p className="text-sm text-zinc-400 mt-0.5">See your AI-generated workouts</p>
            <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0 mt-1" />
          </Link>
        )
      ) : (
        <Link
          to="/workouts"
          className="card block overflow-hidden transition-all duration-200 p-5"
        >
          <h3 className="font-semibold text-zinc-100">Generate your workout plan</h3>
          <p className="text-sm text-zinc-400 mt-0.5">Complete setup to get your AI plan</p>
          <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0 mt-1" />
        </Link>
      )}

      <div className="card p-4">
        <div className="flex items-center gap-2 text-zinc-400 mb-1">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium">Progress</span>
        </div>
        <p className="text-lg font-bold text-zinc-100">
          {weekLogs.length} workout{weekLogs.length !== 1 ? 's' : ''} this week
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {didWorkoutToday ? "Today's workout completed ✓" : 'Keep going!'}
        </p>
      </div>

      {/* Intake Tracker */}
      {planCalTarget > 0 && dailyTotals.calories > 0 && (
        <div className="card p-4">
          {dailyTotals.calories > planCalTarget * 1.1 ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Over target by {Math.round(dailyTotals.calories - planCalTarget)} kcal
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Consider a lighter next meal or some extra activity.
                </p>
              </div>
            </div>
          ) : dailyTotals.calories >= planCalTarget * 0.8 ? (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-200">Nutrition on track</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {Math.round(dailyTotals.calories)} / {planCalTarget} kcal logged today.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {Math.round(planCalTarget - dailyTotals.calories)} kcal remaining
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {Math.round(dailyTotals.calories)} of {planCalTarget} kcal logged. Keep it up!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link to="/bmi" className="card p-4 transition-all duration-200">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-medium">BMI</span>
          </div>
          <p className="text-2xl font-bold text-gradient">{bmi || '—'}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{category}</p>
        </Link>
        <Link to="/bmi" className="card p-4 transition-all duration-200">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium">Calories</span>
          </div>
          <p className="text-2xl font-bold text-accent-neon">{calorieTargetVal || '—'}</p>
          <p className="text-xs text-zinc-500 mt-0.5">target · burn {burnTarget}/day</p>
        </Link>
      </div>

      <div className="flex gap-3">
        <Link
          to="/diet"
          className="flex-1 btn-primary text-center py-3 rounded-xl font-semibold"
        >
          Diet Plan
        </Link>
        <Link
          to="/meal-photo"
          className="flex-1 btn-secondary text-center py-3 rounded-xl font-semibold"
        >
          Log Meal
        </Link>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-zinc-200 mb-2">AI plan</h3>
        <p className="text-sm text-zinc-400 mb-3">
          Regenerate your workout and diet plan with Groq AI based on your current profile.
        </p>
        {generateError && (
          <p className="text-sm text-red-400 mb-2 flex items-center justify-between">
            <span>{generateError}</span>
            <button type="button" onClick={clearError} className="text-zinc-500 hover:text-zinc-300">Dismiss</button>
          </p>
        )}
        <button
          type="button"
          onClick={() => generate(profileForPlan, recentLogs, true).then(() => window.location.reload()).catch(() => {})}
          disabled={generating}
          className="w-full btn-secondary flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating plan…' : 'Regenerate plan'}
        </button>
      </div>

      <Link
        to="/motivation"
        className="block card p-4 text-center text-zinc-400 hover:text-white transition-all duration-200"
      >
        Need a push? Get motivated →
      </Link>
    </div>
  )
}
