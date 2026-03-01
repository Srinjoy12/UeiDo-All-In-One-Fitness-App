import { Link, Navigate } from 'react-router-dom'
import {
    Heartbeat, Flame,
    ArrowRight, DownloadSimple
} from '@phosphor-icons/react'
import { Home, User, Briefcase, Dumbbell } from 'lucide-react'
import { NavBar } from '../components/ui/tubelight-navbar'
import { CyberneticBentoGrid } from '../components/ui/cybernetic-bento-grid'
import { HowItWorks } from '../components/ui/how-it-works'
import { Footer } from '../components/ui/footer'
import { ShimmerButton } from '../components/ui/shimmer-button'
import { useAuth } from '../providers/AuthProvider'

// Local Assets
const IMAGES = {
    hero: '/bodybuilder pictures/Gemini_Generated_Image_v9hsz1v9hsz1v9hs.png',
}

export default function Landing() {
    const { user, loading } = useAuth()

    if (user && !loading) {
        return <Navigate to="/app" replace />
    }

    const navItems = [
        { name: 'Home', url: '#', icon: Home },
        { name: 'Features', url: '#features', icon: User },
        { name: 'How It Works', url: '#how-it-works', icon: Briefcase },
        { name: 'Get Started', url: '/signup', icon: Dumbbell }
    ]

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <div id="home" className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] font-sans selection:bg-[#ff6b40] selection:text-white relative pb-20 sm:pb-0">

            <NavBar items={navItems} className="fixed shadow-2xl z-50" />

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">

                {/* Hero Card */}
                <div className="relative w-full h-[600px] md:h-[750px] bg-[#151515] rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-6 md:p-10">
                    {/* Background Image */}
                    <img
                        src={IMAGES.hero}
                        alt="Hero Bodybuilder"
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-60 mix-blend-lighten pointer-events-none"
                    />
                    {/* Dark gradient overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-[#101010]/50 pointer-events-none" />

                    {/* Floating Indicators */}
                    <div className="absolute top-[20%] right-[10%] z-20 hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <Heartbeat weight="fill" className="text-[#ff6b40]" />
                        <span className="text-white font-bold text-sm">121 <span className="text-xs text-zinc-400 font-medium">bpm</span></span>
                    </div>

                    <div className="absolute bottom-[30%] left-[8%] z-20 hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <Flame weight="fill" className="text-[#ffb703]" />
                        <span className="text-white font-bold text-sm">288 <span className="text-xs text-zinc-400 font-medium">kcal</span></span>
                    </div>

                    {/* Massive Alternating Typography */}
                    <div className="absolute inset-0 flex flex-col justify-center pointer-events-none z-10 px-0 md:px-4 w-full h-full">
                        <div className="flex flex-col gap-2 md:gap-4 w-full mix-blend-plus-lighter opacity-95">
                            <h1 className="text-[12vw] sm:text-[9vw] md:text-[8.5rem] leading-[0.8] font-black uppercase text-left text-white drop-shadow-2xl tracking-tighter">
                                PERSONAL
                            </h1>
                            <h1 className="text-[12vw] sm:text-[9vw] md:text-[8.5rem] leading-[0.8] font-black uppercase text-center text-white drop-shadow-2xl tracking-tighter">
                                AI FITNESS
                            </h1>
                            <h1 className="text-[12vw] sm:text-[9vw] md:text-[8.5rem] leading-[0.8] font-black uppercase text-right text-white drop-shadow-2xl tracking-tighter">
                                ASSISTANT
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Hero Actions (Below Card) */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                    <Link to="/signup">
                        <ShimmerButton
                            background="rgba(21, 21, 21, 1)"
                            shimmerColor="#ff6b40"
                            shimmerSize="0.05em"
                            className="shadow-2xl"
                        >
                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                                <DownloadSimple weight="bold" /> Try For Free
                            </span>
                        </ShimmerButton>
                    </Link>

                    <ShimmerButton
                        onClick={() => scrollToSection('how-it-works')}
                        background="rgba(255, 107, 64, 1)"
                        shimmerColor="#ffffff"
                        shimmerSize="0.05em"
                        className="shadow-2xl"
                    >
                        <span className="flex items-center gap-2 text-sm font-bold text-white">
                            See How It Works <ArrowRight weight="bold" />
                        </span>
                    </ShimmerButton>
                </div>

                {/* Core Features Grid */}
                <div id="features">
                    <CyberneticBentoGrid />
                </div>

            </div>

            {/* How It Works — Timeline Section */}
            <HowItWorks />

            {/* Footer */}
            <Footer />

        </div>
    )
}
