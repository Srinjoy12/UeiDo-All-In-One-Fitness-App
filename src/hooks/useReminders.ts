import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useStore } from '../store/useStore'
import type { Reminder } from '../types'

function toReminder(row: { id: string; label: string; time: string; type: string; enabled: boolean }): Reminder {
  return {
    id: row.id,
    label: row.label,
    time: row.time,
    type: row.type as Reminder['type'],
    enabled: row.enabled,
  }
}

export function useReminders(userId: string | undefined) {
  const [loading, setLoading] = useState(!!userId)
  const { reminders, setReminders, toggleReminder: toggleInStore, removeReminder: removeFromStore } = useStore()

  const refetch = useCallback(async () => {
    if (!userId) {
      setReminders([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('reminders')
      .select('id, label, time, type, enabled')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setReminders((data ?? []).map(toReminder))
    setLoading(false)
  }, [userId, setReminders])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addReminder = useCallback(
    async (r: Omit<Reminder, 'id'>) => {
      if (!userId) return
      const { data, error } = await supabase
        .from('reminders')
        .insert({ user_id: userId, label: r.label, time: r.time, type: r.type, enabled: r.enabled ?? true })
        .select('id, label, time, type, enabled')
        .single()
      if (error) throw error
      setReminders([...reminders, toReminder(data)])
    },
    [userId, reminders, setReminders]
  )

  const removeReminder = useCallback(
    async (id: string) => {
      if (!userId) return
      await supabase.from('reminders').delete().eq('id', id).eq('user_id', userId)
      removeFromStore(id)
    },
    [userId, removeFromStore]
  )

  const toggleReminder = useCallback(
    async (id: string, enabled: boolean) => {
      if (!userId) return
      await supabase.from('reminders').update({ enabled }).eq('id', id).eq('user_id', userId)
      toggleInStore(id, enabled)
    },
    [userId, toggleInStore]
  )

  return { reminders, loading, addReminder, removeReminder, toggleReminder, refetch }
}
