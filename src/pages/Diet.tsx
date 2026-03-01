import { useState } from 'react'
import {
  Lightning,
  Fire,
  ForkKnife,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../hooks/useProfile'
import { usePlan } from '../hooks/usePlan'
import { useGeneratePlan } from '../hooks/useGeneratePlan'
import { useRecentWorkoutLogs } from '../hooks/useRecentWorkoutLogs'
import { useStore } from '../store/useStore'
import { calorieTarget } from '../lib/bmi'
import { useMealLogs } from '../hooks/useMealLogs'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Diet() {
  const { user } = useAuth()
  const { appProfile } = useProfile(user?.id)
  const { plan, refetch: refetchPlan } = usePlan(user?.id)
  const { logs: recentLogs, streak } = useRecentWorkoutLogs(user?.id, 365)
  const { generate, loading: generating, error: generateError, clearError } = useGeneratePlan()
  const { profile } = useStore()
  const profileForPlan = appProfile ?? profile
  const { target } = profileForPlan.heightCm && profileForPlan.weightKg ? calorieTarget(profileForPlan) : { target: 2000 }
  const cal = plan?.calorie_targets?.target ?? plan?.diet_plan?.daily_calories ?? target ?? 2000

  const todayIdx = (new Date().getDay() + 6) % 7
  const [expandedDay, setExpandedDay] = useState<number>(todayIdx + 1)
  const todayDateStr = new Date().getDate();

  const weeklyDays = plan?.diet_plan?.weekly_days ?? []
  const mealTemplates = plan?.diet_plan?.meal_templates ?? []

  const mealsToShow =
    weeklyDays.length > 0
      ? weeklyDays.map((d, i) => ({
        day: i + 1,
        dayLabel: d.day_label ?? FULL_DAYS[i] ?? `Day ${i + 1}`,
        meals: d.meals.map((m) => ({
          name: m.name,
          time: m.time ?? '—',
          calories: Math.round(((m.pct_calories ?? 25) / 100) * cal),
          foods: m.foods ?? [],
        })),
        totalCalories: d.meals.reduce(
          (sum, m) => sum + Math.round(((m.pct_calories ?? 25) / 100) * cal),
          0
        ),
      }))
      : mealTemplates.length > 0
        ? FULL_DAYS.map((label, i) => ({
          day: i + 1,
          dayLabel: label,
          meals: mealTemplates.map((m) => ({
            name: m.name,
            time: m.time ?? '—',
            calories: Math.round(((m.pct_calories ?? 25) / 100) * cal),
            foods: m.foods ?? [],
          })),
          totalCalories: mealTemplates.reduce(
            (sum, m) => sum + Math.round(((m.pct_calories ?? 25) / 100) * cal),
            0
          ),
        }))
        : []

  async function handleGenerate(regenerate = false) {
    try {
      await generate(profileForPlan, recentLogs, regenerate)
      await refetchPlan()
    } catch {
      // Error shown by useGeneratePlan
    }
  }

  const carbs = plan?.diet_plan?.carbs_g ?? Math.round((cal * 0.5) / 4)
  const protein = plan?.diet_plan?.protein_g ?? Math.round((cal * 0.3) / 4)
  const fat = plan?.diet_plan?.fat_g ?? Math.round((cal * 0.2) / 9)

  const { dailyTotals } = useMealLogs(user?.id)
  const consumed = Math.round(dailyTotals?.calories || 0)
  const carbsConsumed = Math.round(dailyTotals?.carbs_g || 0)
  const proteinConsumed = Math.round(dailyTotals?.protein_g || 0)
  const fatConsumed = Math.round(dailyTotals?.fat_g || 0)

  const pctCarbs = carbs > 0 ? Math.min(100, Math.round((carbsConsumed / carbs) * 100)) : 0
  const pctProtein = protein > 0 ? Math.min(100, Math.round((proteinConsumed / protein) * 100)) : 0
  const pctFat = fat > 0 ? Math.min(100, Math.round((fatConsumed / fat) * 100)) : 0

  const pctCal = cal > 0 ? Math.min(100, (consumed / cal) * 100) : 0
  const dashOffset = 289.02 - (289.02 * (pctCal / 100))
  const calLeft = Math.max(0, cal - consumed)

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
            {[1, 2].map((offset) => {
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

      {/* Main Diet Card */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white tracking-wide">
            {plan ? 'Your Diet Plan' : 'Diet Generation'}
          </h2>
          <div className="flex items-center gap-2">
            <Link to="/app/meal-photo" className="text-[11px] font-bold text-[#0d0f14] bg-[#84cc16] hover:bg-[#65a30d] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
              Log Meal
            </Link>
            <span className="text-[11px] font-medium text-zinc-400 hover:text-white cursor-pointer px-3 py-1.5 bg-white/5 rounded-full">
              Details
            </span>
          </div>
        </div>

        {plan ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#84cc16]"></div>
                  <div>
                    <p className="text-xs text-zinc-400 font-medium">Target</p>
                    <p className="text-lg font-bold text-white flex items-center gap-1">
                      <ForkKnife size={16} className="text-[#84cc16]" /> {cal} <span className="text-xs font-normal text-zinc-500">Kcal</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b40]"></div>
                  <div>
                    <p className="text-xs text-zinc-400 font-medium">Consumed</p>
                    <p className="text-lg font-bold text-white flex items-center gap-1">
                      <Fire size={16} className="text-[#ff6b40]" /> {consumed} <span className="text-xs font-normal text-zinc-500">Kcal</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                  <circle
                    cx="56" cy="56" r="46"
                    stroke="#ff6b40"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="289.02"
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white leading-tight">{calLeft}</span>
                  <span className="text-[10px] font-medium text-zinc-500">Kcal left</span>
                </div>
              </div>
            </div>

            {/* Macros Horizontal Bars */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[11px] font-bold text-white">Carbs</span>
                  <span className="text-[10px] text-zinc-500">{carbsConsumed}/{carbs}g</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3b82f6] rounded-full transition-all duration-1000 ease-out" style={{ width: `${pctCarbs}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[11px] font-bold text-white">Protein</span>
                  <span className="text-[10px] text-zinc-500">{proteinConsumed}/{protein}g</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#84cc16] rounded-full transition-all duration-1000 ease-out" style={{ width: `${pctProtein}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[11px] font-bold text-white">Fats</span>
                  <span className="text-[10px] text-zinc-500">{fatConsumed}/{fat}g</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffb703] rounded-full transition-all duration-1000 ease-out" style={{ width: `${pctFat}%` }}></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-zinc-400 text-sm mb-6">
              Your diet will be AI-generated based on your profile, goals, and preferences — with modern dietary tracking.
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
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 font-bold"
            >
              {generating ? 'Generating your plan…' : 'Generate AI Diet Plan'}
            </button>
          </div>
        )}
      </div>

      {/* Meals List */}
      {mealsToShow.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {mealsToShow.map((day) => (
              <button
                key={day.day}
                onClick={() => setExpandedDay(day.day)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${expandedDay === day.day ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                {day.dayLabel}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mealsToShow.find(d => d.day === expandedDay)?.meals.map((m, idx) => (
              <div key={m.name + idx} className="glass-card p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#84cc16]"></div>
                    <h3 className="font-bold text-white text-base">{m.name}</h3>
                    <span className="text-[10px] text-zinc-500 font-medium px-2 py-0.5 bg-white/5 rounded-full ml-1">{m.calories} Kcal</span>
                  </div>
                  <button className="text-[10px] text-zinc-400 font-medium bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
                    Customize
                  </button>
                </div>

                <div className="flex gap-4 items-start bg-[#0d0f14]/50 rounded-2xl p-3 border border-white/5">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#151821] to-[#0d0f14] flex items-center justify-center border border-white/5 shrink-0 mt-0.5">
                    <ForkKnife size={24} className="text-zinc-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-3 space-y-1.5 mt-1">
                      {m.foods.length > 0 ? (
                        m.foods.map((food, i) => (
                          <p key={i} className="font-medium text-white text-[13px] leading-snug">
                            {food}
                          </p>
                        ))
                      ) : (
                        <p className="font-bold text-white text-sm">Meal items</p>
                      )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      <span className="text-[9px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-md">C: {Math.round((m.calories * 0.5) / 4)}g</span>
                      <span className="text-[9px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-md">P: {Math.round((m.calories * 0.3) / 4)}g</span>
                      <span className="text-[9px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-md">F: {Math.round((m.calories * 0.2) / 9)}g</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan && mealsToShow.length > 0 && (
        <button
          type="button"
          onClick={() => handleGenerate(true)}
          disabled={generating}
          className="w-full text-[13px] font-medium text-zinc-500 hover:text-white py-2 flex items-center justify-center gap-2 transition-colors"
        >
          {generating ? 'Regenerating...' : 'Regenerate diet plan'}
        </button>
      )}
    </div>
  )
}
