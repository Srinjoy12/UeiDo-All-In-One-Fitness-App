/** Workout data is now 100% AI-generated from user profile. Only utilities remain. */

import type { PlanWorkoutDay } from '../hooks/usePlan'
import type { Workout } from '../types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Images for AI-generated workouts (matched by workout type/title)
const IMAGES = {
  push: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  pull: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80',
  legs: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80',
  upper: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=400&q=80',
  cardio: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
  home: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
  hiit: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
}

export function getWorkoutImageUrl(workout: { type: string; dayLabel?: string; title?: string }): string | undefined {
  if (workout.type === 'home') {
    const t = (workout.title ?? '').toLowerCase()
    if (t.includes('rest') || t.includes('stretch')) return IMAGES.cardio
    if (t.includes('hiit') || t.includes('cardio')) return IMAGES.hiit
    return IMAGES.home
  }
  const d = (workout.dayLabel ?? '').toLowerCase()
  const t = (workout.title ?? '').toLowerCase()
  if (t.includes('push') || d === 'monday' || d === 'thursday') return IMAGES.push
  if (t.includes('pull') || d === 'tuesday' || d === 'friday') return IMAGES.pull
  if (t.includes('leg') || d === 'wednesday' || d === 'saturday') return IMAGES.legs
  if (t.includes('rest') || d === 'sunday') return IMAGES.cardio
  return IMAGES.upper
}

export function getDayName(d: number): string {
  return DAYS[d] ?? 'Today'
}

export const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

/** Convert PlanWorkoutDay to Workout for display */
export function planDayToWorkout(d: PlanWorkoutDay, type: 'gym' | 'home', id: string): Workout {
  const w = { type, dayLabel: d.day_label, title: d.title }
  return {
    id,
    title: d.title,
    type,
    dayLabel: d.day_label,
    duration: d.duration_min ? `${d.duration_min} min` : '45–60 min',
    difficulty: (d.difficulty as Workout['difficulty']) ?? 'intermediate',
    imageUrl: getWorkoutImageUrl(w),
    exercises: (d.exercises ?? []).map((e) => ({
      name: e.name,
      sets: e.sets ?? '3',
      reps: e.reps ?? '10–12',
      rest: e.rest,
      notes: e.notes,
    })),
  }
}

/** Get today's gym and home workouts from AI plan */
export function getTodayWorkoutsFromPlan(
  plan: { workout_plan?: { gym_week?: PlanWorkoutDay[]; home_week?: PlanWorkoutDay[] } } | null
): { gymToday: Workout | null; homeToday: Workout | null } {
  const gymDays = plan?.workout_plan?.gym_week ?? []
  const homeDays = plan?.workout_plan?.home_week ?? []
  const todayName = DAYS[new Date().getDay()]
  const gymToday = gymDays.find((d) => d.day_label === todayName) ?? gymDays[0]
  const homeToday = homeDays.find((d) => d.day_label === todayName) ?? homeDays[0]
  return {
    gymToday: gymToday ? planDayToWorkout(gymToday, 'gym', `ai-gym-${gymToday.day_label}`) : null,
    homeToday: homeToday ? planDayToWorkout(homeToday, 'home', `ai-home-${homeToday.day_label}`) : null,
  }
}
