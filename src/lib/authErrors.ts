/** Convert Supabase auth errors to user-friendly messages */
export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const msg = error instanceof Error ? error.message : String(error)
  const lower = msg.toLowerCase()

  if (lower.includes('rate limit') || lower.includes('rate_limit')) {
    return 'Too many attempts. Supabase limits emails sent per hour. Wait 10–15 minutes and try again. Tip: Disable "Confirm email" in Supabase Dashboard → Auth → Providers → Email to avoid sending emails on signup.'
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Please confirm your email first. Check your inbox for the confirmation link. Or disable "Confirm email" in Supabase Dashboard → Auth → Providers → Email.'
  }
  if (lower.includes('invalid login') || lower.includes('invalid_credentials')) {
    return 'Invalid email or password.'
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.'
  }

  return msg || fallback
}
