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

  const streak = calculateStreak(logs)

  return { logs, loading, refetch, streak }
}

export function calculateStreak(logs: { date: string; completed: boolean }[]) {
  const dates = Array.from(new Set(logs.filter(l => l.completed).map(l => l.date))).sort((a, b) => b.localeCompare(a))
  let streak = 0
  if (dates.length === 0) return 0

  const todayStr = new Date().toISOString().slice(0, 10)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  let current = todayStr
  if (!dates.includes(todayStr) && dates.includes(yesterdayStr)) {
    current = yesterdayStr
  }

  for (const d of dates) {
    if (d === current) {
      streak++
      const prev = new Date(current)
      prev.setDate(prev.getDate() - 1)
      current = prev.toISOString().slice(0, 10)
    } else if (d < current) {
      break
    }
  }
  return streak
}
