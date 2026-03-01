import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { getAuthErrorMessage } from '../lib/authErrors'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) throw err
      // If we have a session, user can go straight to onboarding (email confirmation disabled)
      if (data.session) {
        navigate('/onboarding')
      } else {
        // Email confirmation required - show helpful message
        setInfo(
          'Account created! To go straight to the questionnaire: Supabase Dashboard → Auth → Providers → Email → turn OFF "Confirm email". Then sign up again. Or check your email to confirm.'
        )
      }
    } catch (e) {
      setError(getAuthErrorMessage(e, 'Sign up failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm card p-6">
        <h1 className="font-display text-2xl font-bold text-zinc-100 mb-1">Create account</h1>
        <p className="text-zinc-400 text-sm mb-6">Sign up for UeiDo</p>
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
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {info && (
            <p className="text-sm text-[#ff3d00]">{info}</p>
          )}
          <button
            type="submit"
            className="w-full btn-primary py-3 rounded-xl font-semibold disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="mt-4 text-center text-zinc-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#ff3d00] hover:opacity-80">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
