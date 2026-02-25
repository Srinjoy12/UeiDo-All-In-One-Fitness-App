import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useRecentWorkoutLogs(userId: string | undefined, days = 14) {
  const [logs, setLogs] = useState<{ date: string; completed: boolean; workout_id?: string }[]>([])
  const [loading, setLoading] = useState(!!userId)

  const refetch = useCallback(async () => {
    if (!userId) {
      setLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    const start = new Date()
    start.setDate(start.getDate() - days)
    const startStr = start.toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('workout_logs')
      .select('date, completed, workout_id')
      .eq('user_id', userId)
      .gte('date', startStr)
      .order('date', { ascending: false })
    if (error) console.error(error)
    setLogs(
      (data ?? []).map((r) => ({
        date: r.date,
        completed: r.completed ?? false,
        workout_id: r.workout_id ?? undefined,
      }))
    )
    setLoading(false)
  }, [userId, days])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { logs, loading, refetch }
}
