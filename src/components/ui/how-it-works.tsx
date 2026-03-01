import { Timeline } from "./timeline";

const IMAGES = {
    step1a: '/bodybuilder pictures/Gemini_Generated_Image_9rvbt09rvbt09rvb.png',
    step1b: '/bodybuilder pictures/Gemini_Generated_Image_ebzh7uebzh7uebzh.png',
    step2a: '/bodybuilder pictures/Gemini_Generated_Image_kwgtu8kwgtu8kwgt.png',
    step2b: '/bodybuilder pictures/Gemini_Generated_Image_qenq2gqenq2gqenq.png',
    step3a: '/bodybuilder pictures/Gemini_Generated_Image_sa1fu4sa1fu4sa1f.png',
    step3b: '/bodybuilder pictures/muscle-man-gym.jpg',
};

const imgClass = "rounded-2xl object-cover h-28 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(255,107,64,0.06),_0_1px_1px_rgba(0,_0,_0,_0.2),_0_0_0_1px_rgba(255,255,255,0.03),_0_16px_68px_rgba(0,_0,_0,_0.3)]";

export function HowItWorks() {
    const data = [
        {
            title: "Step 01",
            content: (
                <div>
                    <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">
                        CREATE YOUR PROFILE
                    </h4>
                    <p className="text-white/50 text-xs md:text-sm font-normal mb-8 max-w-lg">
                        Sign up and complete the onboarding flow. Enter your weight, height, age, gender,
                        activity level, and fitness goal — whether it's losing weight, maintaining, or gaining
                        muscle. This data becomes the foundation for your AI-generated plans.
                    </p>
                    <div className="mb-8 space-y-2">
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="w-2 h-2 rounded-full bg-[#ff6b40]" /> Enter body stats — weight, height, age, gender
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="w-2 h-2 rounded-full bg-[#ff6b40]" /> Choose activity level from sedentary to very active
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Set your goal — lose weight, maintain, or gain muscle
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> AI instantly generates your personalized workout & diet plans
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <img
                            src={IMAGES.step1a}
                            alt="Profile Setup"
                            className={imgClass}
                        />
                        <img
                            src={IMAGES.step1b}
                            alt="Onboarding"
                            className={imgClass}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Step 02",
            content: (
                <div>
                    <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">
                        GET YOUR AI PLANS
                    </h4>
                    <p className="text-white/50 text-xs md:text-sm font-normal mb-8 max-w-lg">
                        Based on your profile, UeiDo generates a complete weekly workout plan and a 7-day meal
                        plan with full macro breakdowns. You can regenerate plans anytime if you want fresh routines
                        or diet options. Your dashboard shows today's workout and calorie targets at a glance.
                    </p>
                    <div className="mb-8 space-y-2">
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> Weekly workout split — Mon to Sun with exercises, sets & reps
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> 7-day meal plan — breakfast, lunch, dinner with macros
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> BMI, TDEE & daily calorie targets calculated automatically
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> Regenerate plans anytime for fresh routines
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <img
                            src={IMAGES.step2a}
                            alt="Workout Plan"
                            className={imgClass}
                        />
                        <img
                            src={IMAGES.step2b}
                            alt="Diet Plan"
                            className={imgClass}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Step 03",
            content: (
                <div>
                    <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">
                        TRAIN & TRACK EVERYTHING
                    </h4>
                    <p className="text-white/50 text-xs md:text-sm font-normal mb-4 max-w-lg">
                        Hit the gym with the built-in workout timer — start, pause, and log every session.
                        Snap photos of your meals for instant AI macro analysis. Set reminders for workouts,
                        meals, and water. Track your weekly streak and crush your fitness goals day by day.
                    </p>
                    <div className="mb-8 space-y-2">
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> Workout timer with start, pause & stop controls
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> Meal Photo AI — snap your plate to get calories & macros
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> Custom reminders with browser push notifications
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> Set your gym location on the map & track geo data
                        </div>
                        <div className="flex gap-3 items-center text-white/70 text-xs md:text-sm">
                            <span className="text-[#ff6b40]">✓</span> Daily motivation quotes & fitness tips to stay fired up
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <img
                            src={IMAGES.step3a}
                            alt="Workout Timer"
                            className={imgClass}
                        />
                        <img
                            src={IMAGES.step3b}
                            alt="Progress Tracking"
                            className={imgClass}
                        />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div id="how-it-works" className="w-full">
            <Timeline data={data} />
        </div>
    );
}
