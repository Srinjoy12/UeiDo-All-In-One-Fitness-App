import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useWorkoutLogToday(userId: string | undefined) {
  const [didWorkoutToday, setDidWorkoutToday] = useState(false)
  const [loading, setLoading] = useState(!!userId)

  const refetch = useCallback(async () => {
    if (!userId) {
      setDidWorkoutToday(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('workout_logs')
      .select('completed')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()
    if (error) console.error(error)
    setDidWorkoutToday(data?.completed ?? false)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { didWorkoutToday, loading, refetch }
}
