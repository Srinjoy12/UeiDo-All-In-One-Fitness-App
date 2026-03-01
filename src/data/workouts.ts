/** Workout data is now 100% AI-generated from user profile. Only utilities remain. */

import type { PlanWorkoutDay } from '../hooks/usePlan'
import type { Workout } from '../types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Images for AI-generated workouts (matched by workout type/title)
const IMAGES = {
  push: '/bodybuilder pictures/Gemini_Generated_Image_9rvbt09rvbt09rvb.png',
  pull: '/bodybuilder pictures/Gemini_Generated_Image_ebzh7uebzh7uebzh.png',
  legs: '/bodybuilder pictures/Gemini_Generated_Image_kwgtu8kwgtu8kwgt.png',
  upper: '/bodybuilder pictures/Gemini_Generated_Image_qenq2gqenq2gqenq.png',
  cardio: '/bodybuilder pictures/Gemini_Generated_Image_sa1fu4sa1fu4sa1f.png',
  home: '/bodybuilder pictures/Gemini_Generated_Image_9rvbt09rvbt09rvb.png',
  hiit: '/bodybuilder pictures/Gemini_Generated_Image_ebzh7uebzh7uebzh.png',
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
