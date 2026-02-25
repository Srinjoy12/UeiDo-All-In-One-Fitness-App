import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export type PlanWorkoutDay = {
  day_label: string
  title: string
  duration_min?: number
  difficulty?: string
  exercises: { name: string; sets?: string; reps?: string; rest?: string; notes?: string }[]
}

export type PlanDietMeal = {
  name: string
  time?: string
  pct_calories?: number
  foods?: string[]
}

export type PlanDietDay = {
  day_label: string
  meals: PlanDietMeal[]
}

export type PlanDiet = {
  daily_calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  meals_per_day?: number
  meal_templates?: PlanDietMeal[]
  weekly_days?: PlanDietDay[]
}

export type PlanCalorieTargets = {
  maintain?: number
  target?: number
  burn_target_per_day?: number
  deficit_or_surplus?: number
}

export type PlanData = {
  workout_plan?: {
    split?: string
    days_per_week?: number
    gym_week?: PlanWorkoutDay[]
    home_week?: PlanWorkoutDay[]
    // Legacy support
    rest_days?: number[]
    weeks?: { week: number; days: (PlanWorkoutDay & { type?: 'gym' | 'home' })[] }[]
  }
  diet_plan?: PlanDiet
  calorie_targets?: PlanCalorieTargets
}

export function usePlan(userId: string | undefined) {
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(!!userId)

  const refetch = useCallback(async () => {
    if (!userId) {
      setPlan(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('plans')
      .select('workout_plan, diet_plan, calorie_targets')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') console.error(error)
    if (data) {
      setPlan({
        workout_plan: (data.workout_plan as PlanData['workout_plan']) ?? undefined,
        diet_plan: (data.diet_plan as PlanData['diet_plan']) ?? undefined,
        calorie_targets: (data.calorie_targets as PlanData['calorie_targets']) ?? undefined,
      })
    } else {
      setPlan(null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { plan, loading, refetch }
}
