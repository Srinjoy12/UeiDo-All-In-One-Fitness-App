import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, Reminder, MealEstimate } from '../types'

const defaultProfile: UserProfile = {
  name: '',
  weightKg: 70,
  heightCm: 170,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
  experienceLevel: 'intermediate',
}

interface AppState {
  profile: UserProfile
  setProfile: (p: Partial<UserProfile>) => void
  reminders: Reminder[]
  setReminders: (r: Reminder[]) => void
  addReminder: (r: Omit<Reminder, 'id'>) => void
  toggleReminder: (id: string, enabled: boolean) => void
  removeReminder: (id: string) => void
  mealEstimates: MealEstimate[]
  addMealEstimate: (m: Omit<MealEstimate, 'id' | 'date'>) => void
  lastGymDay: number
  setLastGymDay: (d: number) => void
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      reminders: [],
      setReminders: (r) => set({ reminders: r }),
      addReminder: (r) =>
        set((s) => ({
          reminders: [
            ...s.reminders,
            { ...r, id: crypto.randomUUID(), enabled: r.enabled ?? true },
          ],
        })),
      toggleReminder: (id, enabled) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, enabled } : r
          ),
        })),
      removeReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      mealEstimates: [],
      addMealEstimate: (m) =>
        set((s) => ({
          mealEstimates: [
            {
              ...m,
              id: crypto.randomUUID(),
              date: new Date().toISOString().slice(0, 10),
            },
            ...s.mealEstimates,
          ],
        })),
      lastGymDay: -1,
      setLastGymDay: (d) => set({ lastGymDay: d }),

      theme: 'dark',
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'ueido-storage' }
  )
)
