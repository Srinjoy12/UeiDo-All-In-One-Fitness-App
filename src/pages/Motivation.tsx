import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, RefreshCw, Quote } from 'lucide-react'
import { QUOTES, TIPS } from '../data/motivation'

const backgrounds = [
  '/bodybuilder pictures/Gemini_Generated_Image_9rvbt09rvbt09rvb.png',
  '/bodybuilder pictures/Gemini_Generated_Image_ebzh7uebzh7uebzh.png',
  '/bodybuilder pictures/Gemini_Generated_Image_kwgtu8kwgtu8kwgt.png',
  '/bodybuilder pictures/Gemini_Generated_Image_qenq2gqenq2gqenq.png',
  '/bodybuilder pictures/Gemini_Generated_Image_sa1fu4sa1fu4sa1f.png',
  '/bodybuilder pictures/Gemini_Generated_Image_8cobrf8cobrf8cob.png',
  '/bodybuilder pictures/Gemini_Generated_Image_k9z6hfk9z6hfk9z6.png',
  '/bodybuilder pictures/Gemini_Generated_Image_p2dmntp2dmntp2dm.png',
  '/bodybuilder pictures/Gemini_Generated_Image_v9hsz1v9hsz1v9hs.png',
  '/bodybuilder pictures/Gemini_Generated_Image_wl6gn0wl6gn0wl6g.png',
]

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude ? arr.filter(i => i !== exclude) : arr
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export default function Motivation() {
  const [quote, setQuote] = useState(QUOTES[0])
  const [tip, setTip] = useState(TIPS[0])
  const [bg, setBg] = useState(backgrounds[0])
  const [key, setKey] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)

  const shuffle = useCallback(() => {
    setIsSpinning(true)
    setQuote(prev => pickRandom(QUOTES, prev))
    setTip(prev => pickRandom(TIPS, prev))
    setBg(prev => pickRandom(backgrounds, prev))
    setKey(k => k + 1)
    setTimeout(() => setIsSpinning(false), 600)
  }, [])

  useEffect(() => {
    shuffle()
  }, [])

  return (
    <div className="relative -mx-4 -mt-6 -mb-28 min-h-screen overflow-hidden flex flex-col justify-end pb-32 pt-20 px-4">
      {/* Background Image — crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bg}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${bg})` }}
        />
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-transparent to-transparent z-10" />

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col gap-5">

        {/* Quote Section */}
        <section className="text-center">
          {/* Decorative Quote Icon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff6b40]/20 to-[#ff3d00]/10 backdrop-blur-md flex items-center justify-center mx-auto border border-[#ff6b40]/20 shadow-[0_0_30px_rgba(255,107,64,0.15)]">
              <Quote className="w-6 h-6 text-[#ff6b40]" />
            </div>
          </motion.div>

          {/* Animated Quote */}
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={key}
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-[1.6rem] md:text-3xl font-black text-white leading-snug tracking-tight mb-8 drop-shadow-lg max-w-md mx-auto"
            >
              "{quote}"
            </motion.blockquote>
          </AnimatePresence>

          {/* Shuffle Button */}
          <motion.button
            type="button"
            onClick={shuffle}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-gradient-to-r from-[#ff6b40] to-[#ff3d00] text-white font-bold text-sm shadow-[0_4px_24px_rgba(255,61,0,0.35)] hover:shadow-[0_4px_32px_rgba(255,61,0,0.5)] transition-all uppercase tracking-wider"
          >
            <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isSpinning ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            New Inspiration
          </motion.button>
        </section>

        {/* Tip Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`tip-${key}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-2xl p-5 border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-xl"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffb703]/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-[#ffb703]" />
              </div>
              <span className="font-bold text-white text-xs tracking-widest uppercase">Pro Tip</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed font-medium">{tip}</p>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
