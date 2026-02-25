import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

export function useReminderNotifications() {
  const reminders = useStore((s) => s.reminders)
  const lastFired = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const interval = setInterval(() => {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      reminders.forEach((r) => {
        if (!r.enabled) return
        const [h, m] = r.time.split(':').map(Number)
        const reminderMinutes = h * 60 + m
        if (Math.abs(currentMinutes - reminderMinutes) < 1) {
          const key = `${r.id}-${now.toDateString()}`
          if (lastFired.current.has(key)) return
          lastFired.current.add(key)
          new Notification('UeiDo Reminder', { body: r.label })
        }
      })
    }, 60_000)

    return () => clearInterval(interval)
  }, [reminders])
}
