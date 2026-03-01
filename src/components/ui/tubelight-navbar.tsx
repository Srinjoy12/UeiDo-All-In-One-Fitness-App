import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items: NavItem[]
    className?: string
}

export function NavBar({ items, className }: NavBarProps) {
    const [activeTab, setActiveTab] = useState(items[0].name)

    const handleClick = (e: React.MouseEvent, item: NavItem) => {
        setActiveTab(item.name)

        // Handle hash links with smooth scroll
        if (item.url.startsWith('#')) {
            e.preventDefault()
            const targetId = item.url === '#' ? '' : item.url.slice(1)

            if (!targetId) {
                // Scroll to top for "Home"
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                const el = document.getElementById(targetId)
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }
        }
    }

    return (
        <div
            className={cn(
                "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:mt-6",
                className,
            )}
        >
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 backdrop-blur-xl py-1 px-1 rounded-full shadow-2xl">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name
                    const isHashLink = item.url.startsWith('#')

                    const content = (
                        <>
                            <span className="hidden md:inline">{item.name}</span>
                            <span className="md:hidden">
                                <Icon size={18} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-0 w-full bg-white/5 rounded-full -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#ff6b40] rounded-t-full">
                                        <div className="absolute w-12 h-6 bg-[#ff6b40]/20 rounded-full blur-md -top-2 -left-2" />
                                        <div className="absolute w-8 h-6 bg-[#ff6b40]/20 rounded-full blur-md -top-1" />
                                        <div className="absolute w-4 h-4 bg-[#ff6b40]/20 rounded-full blur-sm top-0 left-2" />
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )

                    const sharedClass = cn(
                        "relative cursor-pointer text-sm font-bold px-6 py-2 rounded-full transition-colors",
                        "text-white/70 hover:text-white",
                        isActive && "text-white",
                    )

                    // Use <a> for hash links (smooth scroll), <Link> for route navigation
                    if (isHashLink) {
                        return (
                            <a
                                key={item.name}
                                href={item.url}
                                onClick={(e) => handleClick(e, item)}
                                className={sharedClass}
                            >
                                {content}
                            </a>
                        )
                    }

                    return (
                        <Link
                            key={item.name}
                            to={item.url}
                            onClick={(e) => handleClick(e, item)}
                            className={sharedClass}
                        >
                            {content}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
