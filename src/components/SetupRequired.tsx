export function SetupRequired() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a] text-zinc-100">
      <img src="/logo.png" alt="UeiDo Logo" className="w-16 h-16 mb-2 object-contain" />
      <h1 className="font-display text-xl font-bold text-[#ff3d00] mb-2">UeiDo</h1>
      <p className="text-zinc-400 text-sm mb-4 text-center max-w-md">
        Supabase is not configured. Copy <code className="text-zinc-300 bg-zinc-800 px-1 rounded">.env.example</code> to{' '}
        <code className="text-zinc-300 bg-zinc-800 px-1 rounded">.env.local</code> and add your{' '}
        <code className="text-zinc-300 bg-zinc-800 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
        <code className="text-zinc-300 bg-zinc-800 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>.
      </p>
      <p className="text-zinc-500 text-xs text-center max-w-sm">
        Restart the dev server after adding the env file.
      </p>
    </div>
  )
}
