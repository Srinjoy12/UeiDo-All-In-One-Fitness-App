import { useState, useEffect } from 'react'
import { Sparkles, Lightbulb } from 'lucide-react'
import { QUOTES, TIPS } from '../data/motivation'

export default function Motivation() {
  const [quote, setQuote] = useState(QUOTES[0])
  const [tip, setTip] = useState(TIPS[0])

  useEffect(() => {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    const t = TIPS[Math.floor(Math.random() * TIPS.length)]
    setQuote(q)
    setTip(t)
  }, [])

  function shuffle() {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)])
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl font-bold text-zinc-100">Motivation</h2>
        <p className="text-zinc-400 text-sm mt-1">
          A little push to keep you going.
        </p>
      </section>

      <div className="card p-6 text-center">
        <div className="w-12 h-12 rounded-full icon-gradient-bg flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <blockquote className="text-xl font-display font-medium text-zinc-100 leading-relaxed">
          "{quote}"
        </blockquote>
        <button
          type="button"
          onClick={shuffle}
          className="mt-4 text-sm text-gradient hover:opacity-80 font-medium"
        >
          New quote
        </button>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 text-zinc-400 mb-3">
          <Lightbulb className="w-5 h-5 text-white" />
          <span className="font-semibold text-zinc-200">Tip of the day</span>
        </div>
        <p className="text-zinc-300">{tip}</p>
        <button
          type="button"
          onClick={shuffle}
          className="mt-3 text-sm text-gradient hover:opacity-80 font-medium"
        >
          New tip
        </button>
      </div>
    </div>
  )
}
