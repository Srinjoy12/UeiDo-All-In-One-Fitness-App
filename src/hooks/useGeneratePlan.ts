import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { UserProfile } from '../types'

type ProfilePayload = {
  name?: string
  age?: number
  gender?: string
  height_cm?: number
  weight_kg?: number
  experience_level?: string
  goal?: string
  activity_level?: string
  dietary_prefs?: Record<string, unknown>
}

function toPayload(p: UserProfile): ProfilePayload {
  return {
    name: p.name || undefined,
    age: p.age || undefined,
    gender: p.gender || undefined,
    height_cm: p.heightCm || undefined,
    weight_kg: p.weightKg || undefined,
    experience_level: p.experienceLevel || undefined,
    goal: p.goal || undefined,
    activity_level: p.activityLevel || undefined,
    dietary_prefs: {},
  }
}

export function useGeneratePlan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ ok: boolean } | null>(null)

  const generate = useCallback(
    async (
      profile: UserProfile,
      recentLogs?: { date: string; completed: boolean; workout_id?: string }[],
      regenerate?: boolean
    ) => {
      setLoading(true)
      setError(null)
      setData(null)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData?.session?.access_token
        if (!token) {
          throw new Error('Not signed in. Please sign in again and try creating your plan.')
        }
        const { data: res, error: fnError } = await supabase.functions.invoke('generate-plan', {
          body: {
            profile: toPayload(profile),
            recent_logs: recentLogs ?? [],
            regenerate: !!regenerate,
          },
          headers: { Authorization: `Bearer ${token}` },
        })
        if (fnError) throw fnError
        if (res?.error) throw new Error(typeof res.error === 'string' ? res.error : JSON.stringify(res.error))
        setData(res?.ok ? { ok: true } : null)
        return res
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to generate plan'
        setError(message)
        throw e
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { generate, loading, error, data, clearError: () => setError(null) }
}
