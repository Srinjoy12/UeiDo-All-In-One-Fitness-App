import { useState } from "react";
import { GripVertical } from "lucide-react";

function FeatureImageComparison() {
    const [inset, setInset] = useState<number>(50);
    const [onMouseDown, setOnMouseDown] = useState<boolean>(false);

    const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!onMouseDown) return;

        const rect = e.currentTarget.getBoundingClientRect();
        let x = 0;

        if ("touches" in e && e.touches.length > 0) {
            x = e.touches[0].clientX - rect.left;
        } else if ("clientX" in e) {
            x = e.clientX - rect.left;
        }

        const percentage = (x / rect.width) * 100;
        setInset(percentage);
    };

    return (
        <section className="w-full py-24 px-6 md:px-16" id="results">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-6">
                    <div className="flex gap-4 flex-col">
                        <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                            Witness the <span className="text-[#ff6b40]">Transformation</span>
                        </h2>
                        <p className="text-base md:text-lg max-w-xl text-white/60 font-medium leading-relaxed">
                            Stop guessing and start tracking. See how a data-driven approach with UeiDo AI changes your physique over time. Drag the slider to reveal the difference.
                        </p>
                    </div>

                    <div className="pt-8 w-full">
                        <div
                            className="relative aspect-auto w-full max-w-5xl h-[400px] md:h-[600px] overflow-hidden rounded-3xl select-none group border border-white/10 shadow-2xl mx-auto cursor-col-resize"
                            onMouseMove={onMouseMove}
                            onMouseUp={() => setOnMouseDown(false)}
                            onMouseLeave={() => setOnMouseDown(false)}
                            onTouchMove={onMouseMove}
                            onTouchEnd={() => setOnMouseDown(false)}
                        >
                            {/* Draggable Divider Line */}
                            <div
                                className="bg-[#ff6b40] h-full w-[2px] absolute z-20 top-0 -ml-[1px] select-none"
                                style={{
                                    left: inset + "%",
                                }}
                            >
                                {/* Grip Handle */}
                                <button
                                    className="bg-[#222] border-2 border-[#ff6b40] text-white rounded-full hover:scale-110 hover:bg-[#ff6b40] transition-transform w-10 h-10 select-none shadow-[0_0_20px_rgba(255,107,64,0.4)] flex justify-center items-center absolute top-1/2 -translate-y-1/2 -translate-x-[calc(50%-1px)] z-30"
                                    onTouchStart={(e) => {
                                        setOnMouseDown(true);
                                        onMouseMove(e);
                                    }}
                                    onMouseDown={(e) => {
                                        setOnMouseDown(true);
                                        onMouseMove(e);
                                    }}
                                    onTouchEnd={() => setOnMouseDown(false)}
                                    onMouseUp={() => setOnMouseDown(false)}
                                >
                                    <GripVertical className="h-5 w-5 pointer-events-none" />
                                </button>
                            </div>

                            {/* "After" Image (Revealed on the Right, Layered on Top) */}
                            {/* Clipped to the inset percentage */}
                            <img
                                src="/bodybuilder pictures/after.png"
                                alt="UeiDo After Result"
                                className="absolute left-0 top-0 z-10 w-full h-full object-cover object-center select-none scale-110"
                                draggable={false}
                                style={{
                                    clipPath: `inset(0 0 0 ${inset}%)`,
                                }}
                            />

                            {/* "Before" Image (Static Base Layer on the Left) */}
                            <img
                                src="/bodybuilder pictures/before.png"
                                alt="UeiDo Before Picture"
                                className="absolute left-0 top-0 w-full h-full object-cover object-center select-none scale-110"
                                draggable={false}
                            />

                            {/* Overlay Labels */}
                            <div className="absolute top-6 left-6 z-30 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white text-sm font-bold tracking-wider uppercase">
                                Before
                            </div>
                            <div className="absolute top-6 right-6 z-30 px-4 py-2 bg-[#ff6b40]/80 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-bold tracking-wider uppercase">
                                After
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export { FeatureImageComparison };
