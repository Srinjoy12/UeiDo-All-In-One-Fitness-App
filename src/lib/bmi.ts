import type { UserProfile } from '../types'

export function computeBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function idealWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100
  const min = 18.5 * heightM * heightM
  const max = 24.9 * heightM * heightM
  return { min: Math.round(min), max: Math.round(max) }
}

const ACTIVITY_MULT: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function bmrMifflin(weightKg: number, heightCm: number, age: number, gender: string): number {
  if (gender === 'female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
}

export function tdee(profile: UserProfile): number {
  const bmr = bmrMifflin(profile.weightKg, profile.heightCm, profile.age, profile.gender)
  const mult = ACTIVITY_MULT[profile.activityLevel] ?? 1.55
  return Math.round(bmr * mult)
}

export function calorieTarget(profile: UserProfile): { target: number; burnTarget: number; deficitOrSurplus: number } {
  const maintain = tdee(profile)
  let target: number
  let burnTarget: number
  let deficitOrSurplus: number
  if (profile.goal === 'lose') {
    deficitOrSurplus = -500
    target = maintain - 500
    burnTarget = 500
  } else if (profile.goal === 'gain') {
    deficitOrSurplus = 500
    target = maintain + 500
    burnTarget = 0
  } else {
    deficitOrSurplus = 0
    target = maintain
    burnTarget = 300
  }
  return {
    target: Math.max(1200, target),
    burnTarget,
    deficitOrSurplus,
  }
}
