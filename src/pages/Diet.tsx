import { useState } from 'react'
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../hooks/useProfile'
import { usePlan } from '../hooks/usePlan'
import { useGeneratePlan } from '../hooks/useGeneratePlan'
import { useRecentWorkoutLogs } from '../hooks/useRecentWorkoutLogs'
import { useStore } from '../store/useStore'
import { calorieTarget } from '../lib/bmi'

export default function Diet() {
  const { user } = useAuth()
  const { appProfile } = useProfile(user?.id)
  const { plan, refetch: refetchPlan } = usePlan(user?.id)
  const { logs: recentLogs } = useRecentWorkoutLogs(user?.id, 14)
  const { generate, loading: generating, error: generateError, clearError } = useGeneratePlan()
  const { profile } = useStore()
  const profileForPlan = appProfile ?? profile
  const { target } = profileForPlan.heightCm && profileForPlan.weightKg ? calorieTarget(profileForPlan) : { target: 2000 }
  const cal = plan?.calorie_targets?.target ?? plan?.diet_plan?.daily_calories ?? target ?? 2000
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const weeklyDays = plan?.diet_plan?.weekly_days ?? []
  const mealTemplates = plan?.diet_plan?.meal_templates ?? []

  const mealsToShow =
    weeklyDays.length > 0
      ? weeklyDays.map((d, i) => ({
          day: i + 1,
          dayLabel: d.day_label ?? DAYS[i] ?? `Day ${i + 1}`,
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
        ? DAYS.map((label, i) => ({
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

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl font-bold text-zinc-100">Diet Plan</h2>
        <p className="text-zinc-400 text-sm mt-1">
          {plan ? 'AI-generated for you' : 'Get a personalized Indian diet plan'}. Target:{' '}
          <strong className="text-gradient">{cal}</strong> kcal/day.
        </p>
      </section>

      {plan?.diet_plan && (
        <div className="card p-5">
          <p className="text-zinc-400 text-sm">
            Protein: {plan.diet_plan.protein_g ?? '—'}g · Carbs: {plan.diet_plan.carbs_g ?? '—'}g · Fat:{' '}
            {plan.diet_plan.fat_g ?? '—'}g per day.
          </p>
        </div>
      )}

      {!plan && (
        <div className="card p-5">
          <p className="text-zinc-400 text-sm mb-4">
            Your diet will be AI-generated based on your profile, goals, and preferences — with Indian foods like roti, dal, sabzi, paneer, poha, idli, and more.
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
            {generating ? 'Generating your plan…' : 'Generate my AI diet plan'}
          </button>
        </div>
      )}

      {plan && mealsToShow.length > 0 && (
        <button
          type="button"
          onClick={() => handleGenerate(true)}
          disabled={generating}
          className="text-sm text-gradient hover:opacity-80 flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Regenerating…' : 'Regenerate diet plan'}
        </button>
      )}

      {mealsToShow.length > 0 && (
      <div className="space-y-2">
        {mealsToShow.map((day) => (
          <div key={day.day} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-700/30 transition-colors"
            >
              <span className="font-semibold text-zinc-100">
                {day.dayLabel ?? `Day ${day.day}`}
              </span>
              <span className="text-sm text-zinc-400">{day.totalCalories} kcal</span>
              {expandedDay === day.day ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </button>
            {expandedDay === day.day && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-700/50 pt-3">
                {day.meals.map((m) => (
                  <div key={m.name} className="bg-surface-800/60 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-zinc-200">{m.name}</span>
                      <span className="text-sm text-accent-neon">{m.calories} kcal</span>
                    </div>
                    <p className="text-xs text-zinc-500">{m.time}</p>
                    {m.foods.length > 0 && (
                      <ul className="mt-2 text-sm text-zinc-400 list-disc list-inside">
                        {m.foods.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
