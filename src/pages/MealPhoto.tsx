import { useRef, useState } from 'react'
import { Camera, ForkKnife, Flame, Fish, Cookie, Drop, Leaf } from '@phosphor-icons/react'
import { useAuth } from '../providers/AuthProvider'
import { usePlan } from '../hooks/usePlan'
import { useMealLogs } from '../hooks/useMealLogs'
import { supabase } from '../lib/supabaseClient'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

function defaultMealType(): MealType {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 20) return 'dinner'
  return 'snack'
}

function resizeImage(file: File, maxDim = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        const base64 = dataUrl.split(',')[1]
        resolve(base64)
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface AnalysisResult {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  foods: string[]
  description: string
}

export default function MealPhoto() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { plan } = usePlan(user?.id)
  const { meals, dailyTotals, loading: mealsLoading, refetch } = useMealLogs(user?.id)

  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [mealType, setMealType] = useState<MealType>(defaultMealType)
  const [error, setError] = useState<string | null>(null)

  const calorieTarget = (plan?.calorie_targets as Record<string, number> | undefined)?.target ?? 0

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setUploading(true)
    setError(null)
    setResult(null)
    setPreview(URL.createObjectURL(file))

    try {
      const base64 = await resizeImage(file)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error('Not signed in')

      const { data: res, error: fnError } = await supabase.functions.invoke('analyze-meal', {
        body: { image_base64: base64, meal_type: mealType },
        headers: { Authorization: `Bearer ${token}` },
      })
      if (fnError) throw fnError
      if (res?.error) throw new Error(res.error)

      setResult(res as AnalysisResult)
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const pctCalories = calorieTarget > 0 ? Math.min(100, Math.round((dailyTotals.calories / calorieTarget) * 100)) : 0

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-3xl font-bold text-zinc-100 tracking-tight">Log Meal</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Snap a photo of your meal for AI-powered nutrition analysis.
        </p>
      </section>

      {/* Daily Progress */}
      {calorieTarget > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-300">Today's Intake</span>
            <span className="text-sm font-semibold text-zinc-100">
              {Math.round(dailyTotals.calories)} <span className="text-zinc-500 font-normal">/ {calorieTarget} kcal</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#ff3d00] transition-all duration-500"
              style={{ width: `${Math.min(100, pctCalories)}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1"><Fish size={14} weight="regular" /> {Math.round(dailyTotals.protein_g)}g protein</span>
            <span className="flex items-center gap-1"><Cookie size={14} weight="regular" /> {Math.round(dailyTotals.carbs_g)}g carbs</span>
            <span className="flex items-center gap-1"><Drop size={14} weight="regular" /> {Math.round(dailyTotals.fat_g)}g fat</span>
          </div>
        </div>
      )}

      {/* Meal Type Selector */}
      <div className="flex gap-2">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMealType(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${mealType === t ? 'btn-tab-active' : 'bg-[#111] text-zinc-500 hover:text-white border border-white/[0.06]'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div className="card p-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#3b82f6]/50 transition-all duration-200 disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
              <span className="text-zinc-400">Analyzing your meal...</span>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[#3b82f6]/20 flex items-center justify-center">
                <Camera size={32} weight="regular" className="text-[#3b82f6]" />
              </div>
              <span className="font-medium text-zinc-200">Take or upload a photo</span>
              <span className="text-sm text-zinc-500">AI will estimate calories, protein, carbs & more</span>
            </>
          )}
        </button>

        {preview && (
          <div className="mt-4 rounded-xl overflow-hidden border border-white/[0.06]">
            <img src={preview} alt="Meal preview" className="w-full h-48 object-cover" />
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
            <ForkKnife size={20} weight="regular" /> Analysis Result
          </h3>
          <p className="text-sm text-zinc-400">{result.description}</p>

          {result.foods.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.foods.map((f, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#111] text-zinc-300 border border-white/[0.06]">
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111] rounded-xl p-3 text-center border border-white/[0.06]">
              <Flame size={20} weight="fill" className="mx-auto mb-1 text-[#ff3d00]" />
              <p className="text-lg font-bold text-zinc-100">{Math.round(result.calories)}</p>
              <p className="text-xs text-zinc-500">kcal</p>
            </div>
            <div className="bg-[#111] rounded-xl p-3 text-center border border-white/[0.06]">
              <Fish size={20} weight="regular" className="mx-auto mb-1 text-red-400" />
              <p className="text-lg font-bold text-zinc-100">{Math.round(result.protein_g)}g</p>
              <p className="text-xs text-zinc-500">Protein</p>
            </div>
            <div className="bg-[#111] rounded-xl p-3 text-center border border-white/[0.06]">
              <Cookie size={20} weight="regular" className="mx-auto mb-1 text-yellow-400" />
              <p className="text-lg font-bold text-zinc-100">{Math.round(result.carbs_g)}g</p>
              <p className="text-xs text-zinc-500">Carbs</p>
            </div>
            <div className="bg-[#111] rounded-xl p-3 text-center border border-white/[0.06]">
              <Leaf size={20} weight="regular" className="mx-auto mb-1 text-emerald-400" />
              <p className="text-lg font-bold text-zinc-100">{Math.round(result.fat_g)}g</p>
              <p className="text-xs text-zinc-500">Fat</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Meals */}
      {!mealsLoading && meals.length > 0 && (
        <div>
          <h3 className="font-semibold text-zinc-200 mb-3">Today's Meals</h3>
          <ul className="space-y-2">
            {meals.map((m) => (
              <li key={m.id} className="card p-4 flex justify-between items-center gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#111] text-zinc-400 capitalize">{m.meal_type}</span>
                    <span className="font-medium text-zinc-200">{Math.round(m.calories)} kcal</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{m.description}</p>
                </div>
                <div className="text-right text-xs text-zinc-500 shrink-0">
                  <p>{Math.round(m.protein_g)}g P</p>
                  <p>{Math.round(m.carbs_g)}g C</p>
                  <p>{Math.round(m.fat_g)}g F</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
