export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface UserProfile {
  name: string
  weightKg: number
  heightCm: number
  age: number
  gender: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'lose' | 'maintain' | 'gain'
  experienceLevel?: ExperienceLevel
}

export interface BMIRecord {
  bmi: number
  category: string
  idealWeightMin: number
  idealWeightMax: number
  date: string
}

export interface CaloriePlan {
  maintain: number
  target: number
  burnTarget: number
  deficitOrSurplus: number
}

export interface Workout {
  id: string
  title: string
  type: 'gym' | 'home'
  dayLabel: string
  duration: string
  exercises: WorkoutExercise[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  imageUrl?: string
}

export interface WorkoutExercise {
  name: string
  sets: string
  reps: string
  rest?: string
  notes?: string
}

export interface DietPlanDay {
  day: number
  meals: { name: string; time: string; calories: number; foods: string[] }[]
  totalCalories: number
}

export interface Reminder {
  id: string
  label: string
  time: string
  enabled: boolean
  type: 'workout' | 'meal' | 'water' | 'custom'
}

export interface MealEstimate {
  id: string
  imageData?: string
  estimatedCalories: number
  description: string
  date: string
}

export interface MealLog {
  id: string
  user_id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: string[]
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  description: string
  created_at: string
}
