import { useState, useEffect, useCallback, useRef } from 'react'
import { Sun, Moon, MapPin, Navigation, LogOut, User, Crosshair, Search, Loader2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabaseClient'

type SearchResult = { lat: string; lon: string; display_name: string }

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 0.8 })
  }, [lat, lng, map])
  return null
}

function DraggableMarker({
  position,
  onMove,
}: {
  position: [number, number]
  onMove: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng)
    },
  })
  return (
    <Marker
      position={position}
      icon={defaultIcon}
      draggable
      eventHandlers={{
        dragend(e) {
          const m = e.target as L.Marker
          const ll = m.getLatLng()
          onMove(ll.lat, ll.lng)
        },
      }}
    />
  )
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const { profile: dbProfile, refetch: refetchProfile } = useProfile(user?.id)
  const { theme, setTheme } = useTheme()

  const [gymLat, setGymLat] = useState<number>(dbProfile?.gym_lat ?? 28.6139)
  const [gymLng, setGymLng] = useState<number>(dbProfile?.gym_lng ?? 77.209)
  const [gymName, setGymName] = useState(dbProfile?.gym_name ?? '')
  const [geoEnabled, setGeoEnabled] = useState(dbProfile?.geo_tracking_enabled ?? false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dbProfile) {
      if (dbProfile.gym_lat) setGymLat(dbProfile.gym_lat)
      if (dbProfile.gym_lng) setGymLng(dbProfile.gym_lng)
      if (dbProfile.gym_name) setGymName(dbProfile.gym_name)
      setGeoEnabled(dbProfile.geo_tracking_enabled ?? false)
    }
  }, [dbProfile])

  const handleMarkerMove = useCallback((lat: number, lng: number) => {
    setGymLat(lat)
    setGymLng(lng)
    setSaved(false)
  }, [])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchError(null)
    setSearchResults([])
    try {
      const q = encodeURIComponent(searchQuery.trim())
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${q}&limit=10`,
      )
      const json = await res.json()
      const features = json?.features ?? []
      const results: SearchResult[] = features.map((f: { geometry?: { coordinates?: [number, number] }; properties?: Record<string, string> }) => {
        const [lon, lat] = f.geometry?.coordinates ?? [0, 0]
        const p = f.properties ?? {}
        const parts = [p.name, p.street, p.locality, p.city, p.country].filter(Boolean)
        const display_name = parts.join(', ') || 'Unknown'
        return { lat: String(lat), lon: String(lon), display_name }
      }).filter((r: SearchResult) => Number.isFinite(parseFloat(r.lat)) && Number.isFinite(parseFloat(r.lon)))
      if (results.length > 0) {
        setSearchResults(results)
        setSearchError(null)
      } else {
        setSearchError('No places found. Try a different search (e.g. gym name, area, city).')
      }
    } catch {
      setSearchError('Search failed. Check your internet connection.')
    } finally {
      setSearching(false)
    }
  }

  function handleSelectResult(r: SearchResult) {
    const lat = parseFloat(r.lat)
    const lon = parseFloat(r.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return
    setGymLat(lat)
    setGymLng(lon)
    setGymName(r.display_name.split(',')[0].trim() || 'My Gym')
    setSearchResults([])
    setSearchQuery(r.display_name.split(',')[0].trim() || searchQuery)
    setSaved(false)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGymLat(pos.coords.latitude)
        setGymLng(pos.coords.longitude)
        setGymName('My Gym')
        setSaved(false)
      },
      () => { },
      { enableHighAccuracy: true },
    )
  }

  async function handleSaveGym() {
    if (!user?.id) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({
        gym_lat: gymLat,
        gym_lng: gymLng,
        gym_name: gymName || 'My Gym',
        geo_tracking_enabled: geoEnabled,
      })
      .eq('user_id', user.id)
    await refetchProfile()
    setSaving(false)
    setSaved(true)
  }

  async function toggleGeo(val: boolean) {
    setGeoEnabled(val)
    if (!user?.id) return
    if (val) {
      try {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(() => resolve(), reject, { timeout: 5000 })
        })
      } catch {
        setGeoEnabled(false)
        return
      }
    }
    await supabase
      .from('profiles')
      .update({ geo_tracking_enabled: val })
      .eq('user_id', user.id)
    await refetchProfile()
  }

  async function handleThemeChange(t: 'dark' | 'light') {
    setTheme(t)
    if (user?.id) {
      await supabase.from('profiles').update({ theme: t }).eq('user_id', user.id)
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-3xl font-bold text-zinc-100 tracking-tight">Settings</h2>
      </section>

      {/* Account */}
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
          <User className="w-5 h-5" /> Account
        </h3>
        <div className="text-sm text-zinc-400">
          <p>{dbProfile?.name || 'User'}</p>
          <p className="text-zinc-500">{user?.email}</p>
        </div>
      </div>

      {/* Theme */}
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-zinc-200">Theme</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${theme === 'dark' ? 'btn-tab-active' : 'bg-[#111] text-zinc-500 hover:text-white border border-white/[0.06]'
              }`}
          >
            <Moon className="w-5 h-5" /> Dark
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${theme === 'light' ? 'btn-tab-active' : 'bg-[#111] text-zinc-500 hover:text-white border border-white/[0.06]'
              }`}
          >
            <Sun className="w-5 h-5" /> Light
          </button>
        </div>
      </div>

      {/* Gym Location */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Gym Location
        </h3>
        <p className="text-xs text-zinc-500">
          Search for your gym, pick it from the results, then drag the pin if needed. Save when done.
        </p>

        <div ref={searchContainerRef} className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchResults([]) }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search gym or place (e.g. Gold's Gym, Saket)"
              className="input flex-1 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={`${r.lat}-${r.lon}-${i}`}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/[0.06] last:border-0"
                >
                  <span className="text-[#3b82f6] mt-0.5 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span className="text-sm text-zinc-200 leading-snug">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {searchError && (
            <p className="mt-1.5 text-xs text-red-400">{searchError}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Crosshair className="w-4 h-4" /> Use my current location
        </button>

        <div className="h-64 rounded-xl overflow-hidden border border-white/[0.06] relative z-0">
          <MapContainer
            center={[gymLat, gymLng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter lat={gymLat} lng={gymLng} />
            <DraggableMarker position={[gymLat, gymLng]} onMove={handleMarkerMove} />
          </MapContainer>
        </div>
        <p className="text-xs text-zinc-500">Pin marks your gym. Drag the pin to adjust, or tap the map to move it.</p>

        <div>
          <label className="text-sm text-zinc-400 block mb-1">Gym name (for you)</label>
          <input
            type="text"
            value={gymName}
            onChange={(e) => { setGymName(e.target.value); setSaved(false) }}
            placeholder="e.g. Gold's Gym"
            className="input py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleSaveGym}
          disabled={saving}
          className="w-full btn-primary py-2.5 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Mark this as my gym'}
        </button>
      </div>

      {/* Geo-tracking Toggle */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
              <Navigation className="w-5 h-5" /> Auto-Track Gym Visits
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Automatically mark gym workouts as done when you're near your gym for 15 minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleGeo(!geoEnabled)}
            className={`w-12 h-7 rounded-full transition-all duration-200 relative ${geoEnabled ? 'btn-tab-active' : 'bg-[#111] border border-white/[0.06]'
              }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-200 ${geoEnabled ? 'left-6' : 'left-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button
        type="button"
        onClick={() => signOut()}
        className="w-full card p-4 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors"
      >
        <LogOut className="w-5 h-5" /> Sign Out
      </button>
    </div>
  )
}
