import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

/**
 * Handles the OAuth redirect callback.
 * Supabase automatically exchanges the code/token from the URL hash
 * (via detectSessionInUrl: true in supabaseClient.ts).
 * This page listens for the auth state change and redirects accordingly.
 */
export default function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                // Check if user has a profile (completed onboarding) — redirect accordingly
                navigate('/app', { state: { fromLogin: true }, replace: true })
            }
        })

        // Fallback: if already signed in (session restored), redirect after a short delay
        const timeout = setTimeout(async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                navigate('/app', { state: { fromLogin: true }, replace: true })
            } else {
                // Something went wrong, go back to login
                navigate('/login', { replace: true })
            }
        }, 3000)

        return () => {
            subscription.subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                <div className="auth-callback-spinner" />
                <p className="text-zinc-400 mt-4 text-sm">Signing you in…</p>
            </div>
        </div>
    )
}
