import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../providers/AuthProvider'
import { useGeneratePlan } from '../hooks/useGeneratePlan'
import type { UserProfile, ExperienceLevel } from '../types'

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced / Pro' },
]
const GOAL_OPTIONS = [
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain', label: 'Gain muscle' },
]
const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Little or no exercise' },
  { value: 'light', label: 'Light 1–3 days/week' },
  { value: 'moderate', label: 'Moderate 3–5 days/week' },
  { value: 'active', label: 'Active 6–7 days/week' },
  { value: 'very_active', label: 'Very active & physical job' },
]

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) return <Navigate to="/login" replace />
  const { generate, loading: generating, error: generateError, clearError } = useGeneratePlan()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    gender: 'male',
    heightCm: 170,
    weightKg: 70,
    experienceLevel: 'intermediate',
    goal: 'maintain',
    activityLevel: 'moderate',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleFinish() {
    if (!user?.id) return
    setSaveError(null)
    clearError()
    setSaving(true)
    try {
      const row = {
        user_id: user.id,
        name: profile.name ?? '',
        age: profile.age ?? 25,
        gender: profile.gender ?? 'male',
        height_cm: profile.heightCm ?? 170,
        weight_kg: profile.weightKg ?? 70,
        experience_level: profile.experienceLevel ?? 'intermediate',
        goal: profile.goal ?? 'maintain',
        activity_level: profile.activityLevel ?? 'moderate',
        dietary_prefs: {},
        onboarding_completed: true,
      }
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(row, { onConflict: 'user_id' })
      if (upsertErr) throw upsertErr

      const fullProfile: UserProfile = {
        name: profile.name ?? '',
        weightKg: profile.weightKg ?? 70,
        heightCm: profile.heightCm ?? 170,
        age: profile.age ?? 25,
        gender: (profile.gender as 'male' | 'female') ?? 'male',
        activityLevel: (profile.activityLevel as UserProfile['activityLevel']) ?? 'moderate',
        goal: (profile.goal as UserProfile['goal']) ?? 'maintain',
        experienceLevel: (profile.experienceLevel as UserProfile['experienceLevel']) ?? 'intermediate',
      }
      await generate(fullProfile, [])
      navigate('/')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const loading = saving || generating
  const error = saveError || generateError

  return (
    <div className="min-h-screen px-4 py-8 bg-surface-900">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-2xl font-bold text-zinc-100 mb-1">Set up your profile</h1>
        <p className="text-zinc-400 text-sm mb-6">We'll use this to build your personal plan.</p>

        {step === 1 && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-zinc-200">Basics</h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Name</label>
              <input
                type="text"
                className="input"
                value={profile.name ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Age</label>
                <input
                  type="number"
                  className="input"
                  min={10}
                  max={100}
                  value={profile.age ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) || undefined }))}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Gender</label>
                <select
                  className="input"
                  value={profile.gender ?? 'male'}
                  onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value as 'male' | 'female' }))}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  className="input"
                  min={100}
                  max={250}
                  value={profile.heightCm ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, heightCm: Number(e.target.value) || undefined }))}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  className="input"
                  min={30}
                  max={200}
                  value={profile.weightKg ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, weightKg: Number(e.target.value) || undefined }))}
                />
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="w-full btn-primary py-3 rounded-xl font-semibold">
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-zinc-200">Goals & experience</h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Experience level</label>
              <select
                className="input"
                value={profile.experienceLevel ?? 'intermediate'}
                onChange={(e) => setProfile((p) => ({ ...p, experienceLevel: e.target.value as ExperienceLevel }))}
              >
                {EXPERIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Goal</label>
              <select
                className="input"
                value={profile.goal ?? 'maintain'}
                onChange={(e) => setProfile((p) => ({ ...p, goal: e.target.value as UserProfile['goal'] }))}
              >
                {GOAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Activity level</label>
              <select
                className="input"
                value={profile.activityLevel ?? 'moderate'}
                onChange={(e) => setProfile((p) => ({ ...p, activityLevel: e.target.value as UserProfile['activityLevel'] }))}
              >
                {ACTIVITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary py-3 rounded-xl font-semibold">
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 btn-primary py-3 rounded-xl font-semibold disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating your plan…' : 'Create my plan'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}
