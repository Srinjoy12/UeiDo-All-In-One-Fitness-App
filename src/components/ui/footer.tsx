import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { ShimmerButton } from "./shimmer-button";

function Footer() {
    return (
        <footer className="py-16 px-4 md:px-6 bg-[#0a0a0a] border-t border-white/[0.04]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between gap-12">
                    {/* Brand Column */}
                    <div className="mb-8 md:mb-0 max-w-sm">
                        <Link to="/" className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#ff6b40] flex items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">UeiDo</h2>
                        </Link>

                        <p className="text-white/40 text-sm leading-relaxed mb-6">
                            Your all-in-one AI fitness companion. Workout plans, diet tracking,
                            BMI analysis, meal photo AI, and daily motivation — everything you
                            need to transform your fitness journey.
                        </p>

                        <Link to="/signup">
                            <ShimmerButton
                                background="rgba(21, 21, 21, 1)"
                                shimmerColor="#ff6b40"
                                shimmerSize="0.05em"
                                className="shadow-xl"
                            >
                                <span className="text-sm font-bold uppercase tracking-wider text-white">
                                    Get Started Free
                                </span>
                            </ShimmerButton>
                        </Link>

                        <p className="text-white/20 text-xs mt-6">
                            © {new Date().getFullYear()} UeiDo. All rights reserved.
                        </p>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                        <div>
                            <h3 className="font-black text-white uppercase tracking-tighter text-sm mb-4">Features</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/app/workouts" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        AI Workouts
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/diet" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Diet Plans
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/bmi" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        BMI & Calories
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/meal-photo" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Meal Photo AI
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/motivation" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Motivation
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/reminders" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Reminders
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-black text-white uppercase tracking-tighter text-sm mb-4">Account</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/signup" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Sign Up
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Log In
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/settings" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Settings
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-black text-white uppercase tracking-tighter text-sm mb-4">Legal</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white/40 hover:text-[#ff6b40] text-sm transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Giant Brand Name */}
                <div className="w-full flex mt-16 items-center justify-center">
                    <h1 className="text-center text-5xl md:text-7xl lg:text-[12rem] font-black bg-clip-text text-transparent bg-gradient-to-b from-white/[0.08] to-white/[0.02] select-none uppercase tracking-tighter leading-none">
                        UeiDo
                    </h1>
                </div>
            </div>
        </footer>
    );
}

export { Footer };
