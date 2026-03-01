import { useEffect, useRef } from 'react';

// Reusable BentoItem component
const BentoItem = ({ className = '', children }: { className?: string; children: React.ReactNode }) => {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const item = itemRef.current;
        if (!item) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            item.style.setProperty('--mouse-x', `${x}px`);
            item.style.setProperty('--mouse-y', `${y}px`);
        };

        item.addEventListener('mousemove', handleMouseMove);

        return () => {
            item.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div ref={itemRef} className={`bento-item ${className}`}>
            {children}
        </div>
    );
};

const FEATURE_IMAGES = {
    workouts: '/bodybuilder pictures/Gemini_Generated_Image_8cobrf8cobrf8cob.png',
    diet: '/bodybuilder pictures/Gemini_Generated_Image_k9z6hfk9z6hfk9z6.png',
    bmi: '/bodybuilder pictures/Gemini_Generated_Image_p2dmntp2dmntp2dm.png',
    mealPhoto: '/bodybuilder pictures/Gemini_Generated_Image_pd0zappd0zappd0z.png',
    motivation: '/bodybuilder pictures/Gemini_Generated_Image_wl6gn0wl6gn0wl6g.png',
    reminders: '/bodybuilder pictures/guy-light-body-caucasian-abdominal.jpg',
};

// Main Component — real app features
export const CyberneticBentoGrid = () => {
    return (
        <div className="main-container">
            <div className="w-full max-w-6xl z-10">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white text-center mb-8 md:mb-12 uppercase tracking-tighter leading-none">
                    CORE FEATURES
                </h1>

                {/* Mobile: single column stack | Desktop: flex rows with grouping */}
                <div className="flex flex-col gap-3 md:gap-4">

                    {/* TOP ROW */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full">
                        {/* Card 1 — AI Workout Plans (Tall 2/3 width) */}
                        <BentoItem className="w-full md:w-[calc(66.666%-0.5rem)] h-[280px] md:h-[460px]">
                            <img src={FEATURE_IMAGES.workouts} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="relative z-[1] flex flex-col justify-end h-full p-5 md:p-8">
                                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2 md:mb-3">
                                    AI WORKOUT PLANS
                                </h2>
                                <p className="text-white/60 text-xs md:text-sm max-w-md">AI-generated weekly workout routines tailored to your goals. Built-in workout timer with start, pause, and stop controls. Log every session with real-time tracking.</p>
                            </div>
                        </BentoItem>

                        {/* Top Right Column — 2 stacked small cards (1/3 width) */}
                        <div className="flex flex-col gap-3 md:gap-4 w-full md:w-[calc(33.333%-0.5rem)] md:h-[460px]">
                            {/* Card 2 — Smart Diet Plans */}
                            <BentoItem className="w-full h-[220px] md:flex-1 md:h-auto">
                                <img src={FEATURE_IMAGES.diet} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                                <div className="relative z-[1] flex flex-col justify-end h-full p-5 md:p-6">
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                        SMART DIET PLANS
                                    </h2>
                                    <p className="text-white/50 text-xs">AI-generated weekly meal plans with full macro breakdowns — protein, carbs, fat, and calories for every meal.</p>
                                </div>
                            </BentoItem>

                            {/* Card 3 — BMI & Calories */}
                            <BentoItem className="w-full h-[220px] md:flex-1 md:h-auto">
                                <img src={FEATURE_IMAGES.bmi} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                                <div className="relative z-[1] flex flex-col justify-end h-full p-5 md:p-6">
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                        BMI & CALORIES
                                    </h2>
                                    <p className="text-white/50 text-xs">Instant BMI calculation, TDEE estimation, daily calorie targets, and ideal weight range based on your profile.</p>
                                </div>
                            </BentoItem>
                        </div>
                    </div>

                    {/* BOTTOM ROW */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full">
                        {/* Card 4 — Meal Photo AI (Tall 1/3 width) */}
                        <BentoItem className="w-full md:w-[calc(33.333%-0.5rem)] h-[220px] md:h-[460px]">
                            <img src={FEATURE_IMAGES.mealPhoto} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="relative z-[1] flex flex-col justify-end h-full p-5 md:p-6">
                                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                    MEAL PHOTO AI
                                </h2>
                                <p className="text-white/50 text-xs">Snap a photo of your meal and get instant AI analysis — estimated calories, protein, carbs, fat, fiber, and identified foods.</p>
                            </div>
                        </BentoItem>

                        {/* Bottom Right Column — 2 stacked small cards (2/3 width) */}
                        <div className="flex flex-col gap-3 md:gap-4 w-full md:w-[calc(66.666%-0.5rem)] md:h-[460px]">
                            {/* Card 5 — Daily Motivation */}
                            <BentoItem className="w-full h-[220px] md:flex-1 md:h-auto">
                                <img src={FEATURE_IMAGES.motivation} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                                <div className="relative z-[1] flex flex-col justify-end h-full p-5 md:p-6">
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                        DAILY MOTIVATION
                                    </h2>
                                    <p className="text-white/50 text-xs">Immersive full-screen motivation with random fitness quotes, daily tips, and stunning bodybuilder backgrounds to keep you fired up.</p>
                                </div>
                            </BentoItem>

                            {/* Card 6 — Smart Reminders */}
                            <BentoItem className="w-full h-[220px] md:flex-1 md:h-auto">
                                <img src={FEATURE_IMAGES.reminders} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 object-top" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                                <div className="relative z-[1] flex flex-col justify-end h-full p-5 md:p-6">
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                        SMART REMINDERS
                                    </h2>
                                    <p className="text-white/50 text-xs">Set custom reminders for workouts, meals, water intake, and more. Browser notifications keep you on track throughout the day.</p>
                                </div>
                            </BentoItem>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
