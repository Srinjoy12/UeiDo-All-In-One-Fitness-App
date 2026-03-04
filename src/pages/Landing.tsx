import { Navigate } from 'react-router-dom'
import { Home, Briefcase, Dumbbell } from 'lucide-react'
import { NavBar } from '../components/ui/tubelight-navbar'
import { HeroScrollCanvas } from '../components/ui/hero-scroll-canvas'
import { RulerCarousel, type CarouselItem } from '../components/ui/ruler-carousel'
import { FeaturesSection } from '../components/ui/features-section'
import { HowItWorks } from '../components/ui/how-it-works'
import { ComparisonFeatures } from '../components/ui/comparison-features'
import { Footer } from '../components/ui/footer'
import { useAuth } from '../providers/AuthProvider'

const featureItems: CarouselItem[] = [
    { id: 1, title: "AI Workouts" },
    { id: 2, title: "Smart Diets" },
    { id: 3, title: "Macro Tracker" },
    { id: 4, title: "Gym Timer" },
    { id: 5, title: "Meal Photos" },
    { id: 6, title: "Goal Crusher" },
    { id: 7, title: "Body Stats" },
    { id: 8, title: "Daily Motivation" },
    { id: 9, title: "Progress Maps" },
]

export default function Landing() {
    const { user, loading } = useAuth()

    if (user && !loading) {
        return <Navigate to="/app" replace />
    }

    const navItems = [
        { name: 'Home', url: '#', icon: Home },
        { name: 'How It Works', url: '#how-it-works', icon: Briefcase },
        { name: 'Get Started', url: '/signup', icon: Dumbbell }
    ]

    return (
        <div id="home" className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] font-sans selection:bg-[#ff6b40] selection:text-white relative pb-20 sm:pb-0">

            <NavBar items={navItems} className="fixed shadow-2xl z-50" />

            {/* Scroll-linked Canvas Hero */}
            <HeroScrollCanvas />

            {/* Feature Ruler Carousel */}
            <RulerCarousel originalItems={featureItems} />

            {/* Features Section */}
            <FeaturesSection />

            {/* How It Works — Timeline Section */}
            <HowItWorks />

            {/* Why UeiDo Stands Out — Comparison Section */}
            <ComparisonFeatures />

            {/* Footer */}
            <Footer />

        </div>
    )
}
