import { Timeline } from "./timeline";

export function HowItWorks() {
    const headingClass = "text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 bg-gradient-to-br from-white to-[#bef264] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] leading-tight";
    const textClass = "flex gap-4 items-center text-white/70 text-sm md:text-base font-medium";
    const dotClass = "w-2.5 h-2.5 rounded-full shrink-0";

    const data = [
        {
            title: "Step 01",
            content: (
                <div>
                    <h4 className={headingClass}>
                        CREATE YOUR PROFILE
                    </h4>
                    <div className="space-y-4">
                        <div className={textClass}>
                            <span className={`${dotClass} bg-[#ff6b40]`} /> Enter body stats & fitness goals
                        </div>
                        <div className={textClass}>
                            <span className={`${dotClass} bg-[#ff6b40]`} /> Set activity level & target weight
                        </div>
                        <div className={textClass}>
                            <span className={`${dotClass} bg-[#3b82f6]`} /> AI generates your personalized plans instantly
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Step 02",
            content: (
                <div>
                    <h4 className={headingClass}>
                        GET YOUR AI PLANS
                    </h4>
                    <div className="space-y-4">
                        <div className={textClass}>
                            <span className="text-[#ff6b40] text-lg">✓</span> Weekly workout split with sets & reps
                        </div>
                        <div className={textClass}>
                            <span className="text-[#ff6b40] text-lg">✓</span> 7-day meal plan with full macro breakdown
                        </div>
                        <div className={textClass}>
                            <span className="text-[#ff6b40] text-lg">✓</span> BMI, TDEE & calorie targets auto-calculated
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Step 03",
            content: (
                <div>
                    <h4 className={headingClass}>
                        TRAIN & TRACK
                    </h4>
                    <div className="space-y-4">
                        <div className={textClass}>
                            <span className="text-[#ff6b40] text-lg">✓</span> Built-in gym timer & session logger
                        </div>
                        <div className={textClass}>
                            <span className="text-[#ff6b40] text-lg">✓</span> Snap meal photos for instant AI macro analysis
                        </div>
                        <div className={textClass}>
                            <span className="text-[#ff6b40] text-lg">✓</span> Reminders, streaks & daily motivation
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const imageContent = (
        <div className="sticky top-40 flex items-center justify-center h-[70vh]">
            <img
                src="/app mockup/Adobe Express - file.png"
                alt="UeiDo App Interface Showcase"
                className="w-full max-w-[120%] lg:scale-125 h-auto object-contain drop-shadow-[0_20px_50px_rgba(255,107,64,0.15)] filter"
                style={{ marginLeft: '10%' }}
            />
        </div>
    );

    return (
        <div id="how-it-works" className="w-full">
            <Timeline data={data} rightContent={imageContent} />
        </div>
    );
}
