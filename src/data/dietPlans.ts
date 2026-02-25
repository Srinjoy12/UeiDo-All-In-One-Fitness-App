import type { DietPlanDay } from '../types'

function dayPlan(
  day: number,
  totalCal: number,
  meals: { name: string; time: string; pct: number; foods: string[] }[]
): DietPlanDay {
  const mealEntries = meals.map((m) => ({
    name: m.name,
    time: m.time,
    calories: Math.round((m.pct / 100) * totalCal),
    foods: m.foods,
  }))
  const totalCalories = mealEntries.reduce((s, m) => s + m.calories, 0)
  return { day, meals: mealEntries, totalCalories }
}

export function getDietPlanForCalories(targetCal: number): DietPlanDay[] {
  const template = [
    { name: 'Breakfast', time: '7:00–8:00 AM', pct: 25, foods: ['Poha / Upma / Idli / Paratha', 'Dahi or chai', 'Fruit (banana, apple)'] },
    { name: 'Mid-morning', time: '10:00 AM', pct: 10, foods: ['Chana / nuts / fruit / lassi'] },
    { name: 'Lunch', time: '12:30–1:30 PM', pct: 30, foods: ['Roti / Rice / Chapati', 'Dal / Sabzi / Chicken curry', 'Salad, raita'] },
    { name: 'Pre-workout', time: '4:00–5:00 PM', pct: 10, foods: ['Banana / dates / chikki / nuts'] },
    { name: 'Dinner', time: '7:30–8:30 PM', pct: 25, foods: ['Roti / Rice', 'Dal / Paneer / Fish curry', 'Sabzi', 'Salad'] },
  ]
  return [1, 2, 3, 4, 5, 6, 7].map((d) =>
    dayPlan(
      d,
      targetCal,
      template.map((m) => ({ ...m, foods: [...m.foods] }))
    )
  )
}

export const DIET_TIPS: Record<string, string[]> = {
  lose: [
    'Include dal, paneer, or chicken with every meal for protein.',
    'Fill half your plate with sabzi and salad.',
    'Avoid fried snacks, sweets, and sugary chai.',
    'Drink water before meals; limit ghee/oil.',
  ],
  maintain: [
    'Balance: roti, rice, dal, sabzi, and protein.',
    'Eat at consistent times (Indian meal timings).',
    'Include fiber: dal, vegetables, whole grains.',
  ],
  gain: [
    'Add calorie-dense snacks: chikki, nuts, dry fruits, lassi.',
    'Larger portions of rice, roti, and dal.',
    'Post-workout: banana + milk or paneer paratha.',
  ],
}
