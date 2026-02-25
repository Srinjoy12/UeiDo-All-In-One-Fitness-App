import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

interface GeoState {
  nearGym: boolean
  timerSeconds: number
  autoLogged: boolean
  tracking: boolean
  error: string | null
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const RADIUS_M = 100
const AUTO_LOG_SECONDS = 15 * 60

export function useGeoTracking(
  userId: string | undefined,
  gymLat: number | null | undefined,
  gymLng: number | null | undefined,
  enabled: boolean,
) {
  const [state, setState] = useState<GeoState>({
    nearGym: false, timerSeconds: 0, autoLogged: false, tracking: false, error: null,
  })

  const watchId = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const enteredAt = useRef<number | null>(null)
  const loggedRef = useRef(false)

  const autoLog = useCallback(async () => {
    if (!userId || loggedRef.current) return
    loggedRef.current = true
    const today = new Date().toISOString().slice(0, 10)

    const { data: existing } = await supabase
      .from('workout_logs')
      .select('id, completed')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    if (existing?.completed) {
      setState((s) => ({ ...s, autoLogged: true }))
      return
    }

    await supabase.from('workout_logs').upsert(
      {
        user_id: userId,
        date: today,
        completed: true,
        auto_logged: true,
        workout_type: 'gym',
      },
      { onConflict: 'user_id,date' },
    )
    setState((s) => ({ ...s, autoLogged: true }))
  }, [userId])

  useEffect(() => {
    if (!enabled || !gymLat || !gymLng || !userId || !navigator.geolocation) {
      setState((s) => ({ ...s, tracking: false, error: !navigator.geolocation ? 'Geolocation not supported' : null }))
      return
    }

    setState((s) => ({ ...s, tracking: true, error: null }))

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const dist = haversineMeters(pos.coords.latitude, pos.coords.longitude, gymLat, gymLng)
        const near = dist <= RADIUS_M

        if (near && !enteredAt.current) {
          enteredAt.current = Date.now()
        } else if (!near) {
          enteredAt.current = null
        }

        setState((s) => ({ ...s, nearGym: near, error: null }))
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, tracking: false }))
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )

    timerRef.current = setInterval(() => {
      if (!enteredAt.current) {
        setState((s) => ({ ...s, timerSeconds: 0 }))
        return
      }
      const elapsed = Math.floor((Date.now() - enteredAt.current) / 1000)
      setState((s) => ({ ...s, timerSeconds: elapsed }))

      if (elapsed >= AUTO_LOG_SECONDS && !loggedRef.current) {
        autoLog()
      }
    }, 5000)

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
      if (timerRef.current) clearInterval(timerRef.current)
      enteredAt.current = null
    }
  }, [enabled, gymLat, gymLng, userId, autoLog])

  return state
}
