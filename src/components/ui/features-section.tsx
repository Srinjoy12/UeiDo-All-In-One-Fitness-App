import { motion } from 'framer-motion'

const row1 = "AI WORKOUTS • SMART TRACKING • CUSTOM PLANS • REAL RESULTS • "
const row2 = "DIET PLANS • MACRO TRACKER • MEAL PHOTOS • CALORIE AI • "
const row3 = "IRON DISCIPLINE • GYM TIMER • DAILY MOTIVATION • GOAL CRUSHER • "

function MarqueeRow({ text, direction, duration, opacity }: { text: string; direction: 'left' | 'right'; duration: number; opacity: [number, number] }) {
    const content = text.repeat(6)
    return (
        <div className="overflow-hidden whitespace-nowrap w-full">
            <motion.div
                className="inline-block whitespace-nowrap font-black uppercase tracking-tighter"
                style={{
                    background: `linear-gradient(180deg, rgba(0,0,0,${opacity[0]}) 0%, rgba(0,0,0,${opacity[1]}) 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
                animate={{ x: direction === 'left' ? ["0%", "-50%"] : ["-50%", "0%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration }}
            >
                {content}
            </motion.div>
        </div>
    )
}

export function FeaturesSection() {
    return (
        <div className="py-16 relative z-0 overflow-hidden flex flex-col items-center justify-center" id="features" style={{ background: '#e65100', borderRadius: '3rem', minHeight: '80vh' }}>

            {/* Infinite Slider Background Text */}
            <div className="absolute inset-0 flex flex-col justify-center select-none z-0 gap-2" style={{ fontSize: 'clamp(4rem, 10vw, 12rem)' }}>
                <MarqueeRow text={row1} direction="right" duration={60} opacity={[0.85, 0.6]} />
                <MarqueeRow text={row2} direction="left" duration={70} opacity={[0.5, 0.3]} />
                <MarqueeRow text={row3} direction="right" duration={55} opacity={[0.3, 0.08]} />
            </div>

            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pointer-events-none">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '68rem', transition: 'transform 0.5s', filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.5))' }}>
                        <img
                            style={{ width: '100%', objectFit: 'contain' }}
                            src="/app%20mockup/Untitled.png"
                            alt="UeiDo App Features Interface"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
