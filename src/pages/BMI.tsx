import { useState } from 'react'
import type { UserProfile } from '../types'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../hooks/useProfile'
import { useStore } from '../store/useStore'
import {
  computeBMI,
  getBMICategory,
  idealWeightRange,
  calorieTarget,
  tdee,
} from '../lib/bmi'
import { DIET_TIPS } from '../data/dietPlans'

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Little or no exercise',
  light: 'Light 1–3 days/week',
  moderate: 'Moderate 3–5 days/week',
  active: 'Active 6–7 days/week',
  very_active: 'Very active & physical job',
}

const GOAL_LABELS: Record<string, string> = {
  lose: 'Lose weight',
  maintain: 'Maintain',
  gain: 'Gain muscle',
}

export default function BMI() {
  const { user } = useAuth()
  const { updateProfile: persistProfile } = useProfile(user?.id)
  const { profile, setProfile } = useStore()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    if (!user?.id) return
    setSaveError(null)
    setSaving(true)
    try {
      await persistProfile(profile)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const bmi =
    profile.heightCm && profile.weightKg
      ? computeBMI(profile.weightKg, profile.heightCm)
      : 0
  const category = bmi ? getBMICategory(bmi) : '—'
  const ideal = profile.heightCm ? idealWeightRange(profile.heightCm) : { min: 0, max: 0 }
  const { target, burnTarget, deficitOrSurplus } = profile.heightCm && profile.weightKg
    ? calorieTarget(profile)
    : { target: 0, burnTarget: 0, deficitOrSurplus: 0 }
  const maintain = profile.heightCm && profile.weightKg ? tdee(profile) : 0
  const tips = profile.goal ? DIET_TIPS[profile.goal] ?? [] : []

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl font-bold text-zinc-100">BMI & Calories</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Enter your stats to get BMI, calorie target, and burn goal.
        </p>
      </section>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-zinc-200">Your profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2">
            <span className="text-sm text-zinc-400 block mb-1">Name</span>
            <input
              type="text"
              className="input"
              placeholder="Your name"
              value={profile.name}
              onChange={(e) => setProfile({ name: e.target.value })}
            />
          </label>
          <label>
            <span className="text-sm text-zinc-400 block mb-1">Weight (kg)</span>
            <input
              type="number"
              min={30}
              max={200}
              className="input"
              value={profile.weightKg || ''}
              onChange={(e) => setProfile({ weightKg: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            <span className="text-sm text-zinc-400 block mb-1">Height (cm)</span>
            <input
              type="number"
              min={100}
              max={250}
              className="input"
              value={profile.heightCm || ''}
              onChange={(e) => setProfile({ heightCm: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            <span className="text-sm text-zinc-400 block mb-1">Age</span>
            <input
              type="number"
              min={10}
              max={100}
              className="input"
              value={profile.age || ''}
              onChange={(e) => setProfile({ age: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            <span className="text-sm text-zinc-400 block mb-1">Gender</span>
            <select
              className="input"
              value={profile.gender}
              onChange={(e) => setProfile({ gender: e.target.value as 'male' | 'female' })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="col-span-2">
            <span className="text-sm text-zinc-400 block mb-1">Activity level</span>
            <select
              className="input"
              value={profile.activityLevel}
              onChange={(e) =>
                setProfile({
                  activityLevel: e.target.value as UserProfile['activityLevel'],
                })
              }
            >
              {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2">
            <span className="text-sm text-zinc-400 block mb-1">Goal</span>
            <select
              className="input"
              value={profile.goal}
              onChange={(e) =>
                setProfile({ goal: e.target.value as 'lose' | 'maintain' | 'gain' })
              }
            >
              {Object.entries(GOAL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        {saveError && <p className="text-sm text-red-400 mt-2">{saveError}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary py-2.5 mt-2 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>

      {bmi > 0 && (
        <>
          <div className="card p-5">
            <h3 className="font-semibold text-zinc-200 mb-4">BMI</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gradient">{bmi}</span>
              <span className="text-zinc-400">{category}</span>
            </div>
            <p className="text-sm text-zinc-500 mt-2">
              Ideal weight range: {ideal.min}–{ideal.max} kg (for your height).
            </p>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-zinc-200 mb-4">Calories</h3>
            <ul className="space-y-2 text-zinc-300">
              <li>Maintain weight: <strong className="text-zinc-100">{maintain}</strong> kcal/day</li>
              <li>Your target: <strong className="text-accent-neon">{target}</strong> kcal/day</li>
              <li>Burn goal: <strong className="text-accent-neon">{burnTarget}</strong> kcal/day (exercise + activity)</li>
              {deficitOrSurplus !== 0 && (
                <li>
                  {deficitOrSurplus < 0 ? 'Deficit' : 'Surplus'}: {Math.abs(deficitOrSurplus)} kcal
                </li>
              )}
            </ul>
          </div>

          {tips.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-zinc-200 mb-3">Diet tips for your goal</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                {tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
