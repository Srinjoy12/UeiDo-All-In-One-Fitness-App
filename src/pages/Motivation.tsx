import { useState, useEffect } from 'react'
import { Sparkles, Lightbulb } from 'lucide-react'
import { QUOTES, TIPS } from '../data/motivation'

export default function Motivation() {
  const [quote, setQuote] = useState(QUOTES[0])
  const [tip, setTip] = useState(TIPS[0])

  // High quality fitness photography
  const backgrounds = [
    '/bodybuilder pictures/Gemini_Generated_Image_9rvbt09rvbt09rvb.png',
    '/bodybuilder pictures/Gemini_Generated_Image_ebzh7uebzh7uebzh.png',
    '/bodybuilder pictures/Gemini_Generated_Image_kwgtu8kwgtu8kwgt.png',
    '/bodybuilder pictures/Gemini_Generated_Image_qenq2gqenq2gqenq.png',
    '/bodybuilder pictures/Gemini_Generated_Image_sa1fu4sa1fu4sa1f.png'
  ]

  const [bg, setBg] = useState(backgrounds[0])

  useEffect(() => {
    shuffle()
  }, [])

  function shuffle() {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)])
    setBg(backgrounds[Math.floor(Math.random() * backgrounds.length)])
  }

  return (
    <div className="relative -mx-4 -mt-6 -mb-28 min-h-screen overflow-hidden flex flex-col justify-end pb-32 pt-20 px-4">
      {/* Immersive Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out z-0"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/20 z-10" />

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col gap-6">
        <section className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <blockquote className="text-2xl md:text-3xl font-display font-bold text-white leading-tight mb-6 drop-shadow-lg">
            "{quote}"
          </blockquote>
          <button
            type="button"
            onClick={shuffle}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff6b40] to-[#ff3d00] text-white font-bold text-sm shadow-[0_0_20px_rgba(255,61,0,0.3)] hover:scale-105 transition-transform"
          >
            Generate New Quote
          </button>
        </section>

        <div className="glass-card p-5 border border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Lightbulb className="w-5 h-5 text-[#ffb703]" />
            <span className="font-bold text-white text-sm tracking-wide uppercase">Tip of the day</span>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">{tip}</p>
        </div>
      </div>
    </div>
  )
}
