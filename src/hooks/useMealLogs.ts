import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { MealLog } from '../types'

interface DailyTotals {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
}

export function useMealLogs(userId: string | undefined, date?: string) {
  const [meals, setMeals] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(false)
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0,
  })

  const targetDate = date ?? new Date().toISOString().slice(0, 10)

  const refetch = useCallback(async () => {
    if (!userId) {
      setMeals([])
      setDailyTotals({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 })
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('useMealLogs error:', error)
      setLoading(false)
      return
    }

    const rows = (data ?? []) as unknown as MealLog[]
    setMeals(rows)

    const totals = rows.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein_g: acc.protein_g + (m.protein_g || 0),
        carbs_g: acc.carbs_g + (m.carbs_g || 0),
        fat_g: acc.fat_g + (m.fat_g || 0),
        fiber_g: acc.fiber_g + (m.fiber_g || 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
    )
    setDailyTotals(totals)
    setLoading(false)
  }, [userId, targetDate])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { meals, dailyTotals, loading, refetch }
}
