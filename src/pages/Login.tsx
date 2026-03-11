import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getAuthErrorMessage } from '../lib/authErrors'
import SocialAuthButtons from '../components/SocialAuthButtons'
import { GradientBars } from '../components/ui/gradient-bars'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      navigate('/app', { state: { fromLogin: true } })
    } catch (e) {
      setError(getAuthErrorMessage(e, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-black overflow-hidden">
      <GradientBars />

      <div className="w-full max-w-sm card p-6 relative z-10">
        <h1 className="font-display text-2xl font-bold text-zinc-100 mb-1">Welcome back</h1>
        <p className="text-zinc-400 text-sm mb-6">Sign in to UeiDo</p>

        <SocialAuthButtons />

        <div className="auth-divider">
          <span>or sign in with email</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="w-full btn-primary py-3 rounded-xl font-semibold disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-zinc-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#ff3d00] hover:text-[#ff5722]">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
