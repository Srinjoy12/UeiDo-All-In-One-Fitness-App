import React from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { ShimmerButton } from "./shimmer-button";
import { cn } from "../../lib/utils";

export function ComparisonFeatures() {
    const features = [
        { name: "AI workout plans with animated timer", us: true, others: false },
        { name: "Smart macro-calculated diet plans", us: true, others: false },
        { name: "Instant BMI & TDEE calculation", us: true, others: false },
        { name: "Instant meal photo AI analysis", us: true, others: false },
        { name: "Custom push notifications & reminders", us: true, others: false },
        { name: "Free without premium subscription walls", us: true, others: false },
    ];

    return (
        <section className="py-24 px-4 md:px-8 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff6b40]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#ff6b40]">
                            <span className="normal-case">UeiDo</span> vs Others
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                        Why <span className="normal-case">UeiDo</span> stands out
                    </h2>

                    <p className="max-w-2xl mx-auto text-white/50 text-sm md:text-base leading-relaxed">
                        UeiDo combines advanced AI fitness tracking with smart workout support, giving you more useful tools than most traditional fitness apps while keeping everything simple and completely free.
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="mt-20">

                    {/* Unified Grid Container */}
                    <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_180px_180px] w-full">

                        {/* --- HEADERS --- */}
                        <div className="pb-6"></div> {/* Empty top-left */}

                        {/* UeiDo Header (Highlighted) */}
                        <div className="flex flex-col justify-center items-center pb-6 relative gap-2">
                            {/* Highlight Top Extension */}
                            <div className="absolute inset-0 bg-white/[0.04] rounded-t-3xl -z-10" />
                            <img src="/logo.png" alt="UeiDo Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                            <h3 className="text-sm sm:text-lg md:text-2xl font-black text-white tracking-tighter">
                                UeiDo
                            </h3>
                        </div>

                        {/* Other Apps Header */}
                        <div className="flex justify-center items-end pb-6">
                            <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-white/40 uppercase tracking-widest md:tracking-wider text-center px-1">
                                Other Apps
                            </h3>
                        </div>

                        {/* --- ROWS --- */}
                        {features.map((f, i) => {
                            const isLast = i === features.length - 1;

                            return (
                                <React.Fragment key={i}>
                                    {/* Feature Name */}
                                    <div className={cn(
                                        "py-3 px-2 sm:px-4 md:py-4 md:px-8 bg-white/[0.02] flex items-center",
                                        i === 0 && "rounded-tl-2xl border-t border-white/5",
                                        isLast && "rounded-bl-2xl border-b border-white/5",
                                        !isLast && "border-b border-white/5",
                                    )}>
                                        <span className="text-white/70 text-xs sm:text-sm md:text-base font-medium leading-tight">
                                            {f.name}
                                        </span>
                                    </div>

                                    {/* UeiDo Check (Highlighted) */}
                                    <div className={cn(
                                        "flex justify-center items-center py-3 md:py-4 relative bg-white/[0.04] z-10"
                                    )}>
                                        {f.us ? (
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#ff6b40]/20 flex items-center justify-center">
                                                <Check className="w-4 h-4 md:w-5 md:h-5 text-[#ff6b40]" strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <X className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                                        )}
                                    </div>

                                    {/* Other Apps Check */}
                                    <div className={cn(
                                        "flex justify-center items-center py-3 md:py-4 bg-white/[0.02]",
                                        i === 0 && "rounded-tr-2xl border-t border-white/5",
                                        isLast && "rounded-br-2xl border-b border-white/5",
                                        !isLast && "border-b border-white/5"
                                    )}>
                                        {f.others ? (
                                            <Check className="w-4 h-4 md:w-5 md:h-5 text-white/40" />
                                        ) : (
                                            <X className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                                        )}
                                    </div>
                                </React.Fragment>
                            );
                        })}

                        {/* --- FOOTER CTA --- */}
                        <div></div> {/* Empty bottom-left */}

                        {/* UeiDo CTA (Highlighted) */}
                        <div className="flex justify-center pt-8 pb-10 relative">
                            {/* Highlight Bottom Extension */}
                            <div className="absolute inset-0 bg-white/[0.04] rounded-b-3xl -z-10" />
                            <Link to="/signup" className="relative z-10 w-full px-6">
                                <ShimmerButton
                                    background="rgba(255, 107, 64, 1)"
                                    shimmerColor="#ffffff"
                                    shimmerSize="0.05em"
                                    className="w-full py-3 shadow-xl"
                                >
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                                        Start Now
                                    </span>
                                </ShimmerButton>
                            </Link>
                        </div>

                        <div></div> {/* Empty bottom-right */}
                    </div>

                </div>
            </div>
        </section>
    );
}
