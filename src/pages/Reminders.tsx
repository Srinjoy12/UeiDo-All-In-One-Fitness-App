import { useState } from 'react'
import { Bell, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { useReminders } from '../hooks/useReminders'
import type { Reminder } from '../types'

const REMINDER_TYPES: { value: Reminder['type']; label: string }[] = [
  { value: 'workout', label: 'Workout' },
  { value: 'meal', label: 'Meal' },
  { value: 'water', label: 'Water' },
  { value: 'custom', label: 'Custom' },
]

export default function Reminders() {
  const { user } = useAuth()
  const { reminders, loading, addReminder, removeReminder, toggleReminder } = useReminders(user?.id)
  const [label, setLabel] = useState('')
  const [time, setTime] = useState('08:00')
  const [type, setType] = useState<Reminder['type']>('workout')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    try {
      await addReminder({ label: label.trim(), time, type, enabled: true })
      setLabel('')
      setTime('08:00')
    } catch (err) {
      console.error(err)
    }
  }

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-3xl font-bold text-zinc-100 tracking-tight">Reminders</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Set reminders for workouts, meals, and more. You'll get browser notifications.
        </p>
      </section>

      <div className="card p-5">
        <p className="text-zinc-400 text-sm mb-4">
          Enable notifications for this site so reminders can fire when the app is in the background.
        </p>
        <button
          type="button"
          onClick={requestNotificationPermission}
          className="btn-secondary flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Enable notifications
        </button>
      </div>

      <form onSubmit={handleAdd} className="card p-5 space-y-4">
        <h3 className="font-semibold text-zinc-200">Add reminder</h3>
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Label</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Morning workout"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Time</label>
            <input
              type="time"
              className="input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Type</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value as Reminder['type'])}
            >
              {REMINDER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2 w-full justify-center">
          <Plus className="w-4 h-4" />
          Add reminder
        </button>
      </form>

      {loading && <p className="text-zinc-400 text-sm">Loading reminders…</p>}
      {!loading && reminders.length > 0 && (
        <div>
          <h3 className="font-semibold text-zinc-200 mb-3">Your reminders</h3>
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleReminder(r.id, !r.enabled)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      r.enabled ? 'btn-tab-active' : 'bg-[#111] border border-white/[0.06]'
                    }`}
                    role="switch"
                    aria-checked={r.enabled}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white shadow mt-1 transition-transform ${
                        r.enabled ? 'translate-x-5 ml-1' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div>
                    <p className="font-medium text-zinc-200">{r.label}</p>
                    <p className="text-sm text-zinc-500">{r.time} · {r.type}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeReminder(r.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
