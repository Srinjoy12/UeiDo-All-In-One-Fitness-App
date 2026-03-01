import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables } from '../lib/database.types'
import type { UserProfile } from '../types'

type DbProfile = Tables<'profiles'>

function toAppProfile(row: DbProfile | null): UserProfile | null {
  if (!row) return null
  return {
    name: row.name ?? '',
    weightKg: row.weight_kg ?? 70,
    heightCm: row.height_cm ?? 170,
    age: row.age ?? 25,
    gender: (row.gender as 'male' | 'female') ?? 'male',
    activityLevel: (row.activity_level as UserProfile['activityLevel']) ?? 'moderate',
    goal: (row.goal as UserProfile['goal']) ?? 'maintain',
    experienceLevel: (row.experience_level as UserProfile['experienceLevel']) ?? 'intermediate',
  }
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [fetchedUserId, setFetchedUserId] = useState<string | undefined>(undefined)
  const [isFetching, setIsFetching] = useState(false)

  const loading = isFetching || (!!userId && fetchedUserId !== userId)

  const refetch = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setFetchedUserId(undefined)
      setIsFetching(false)
      return
    }
    setIsFetching(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') console.error(error)
    setProfile(data ?? null)
    setFetchedUserId(userId)
    setIsFetching(false)
  }, [userId])

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!userId) return
      const row = {
        user_id: userId,
        name: updates.name ?? '',
        weight_kg: updates.weightKg ?? null,
        height_cm: updates.heightCm ?? null,
        age: updates.age ?? null,
        gender: updates.gender ?? 'male',
        activity_level: updates.activityLevel ?? 'moderate',
        goal: updates.goal ?? 'maintain',
        experience_level: updates.experienceLevel ?? 'intermediate',
      }
      const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'user_id' })
      if (error) throw error
      await refetch()
    },
    [userId, refetch]
  )

  useEffect(() => {
    refetch()
  }, [refetch])

  const appProfile = useMemo(() => toAppProfile(profile), [profile])

  return {
    profile,
    appProfile,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    lastSeenRoute: profile?.last_seen_route ?? '/app',
    loading,
    refetch,
    updateProfile,
  }
}
