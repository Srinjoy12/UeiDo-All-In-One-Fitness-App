"use client";

import { Button } from "../ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import createGlobe, { type COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"

export default function GlobeFeatureSection() {
    return (
        <section className="relative w-full mx-auto overflow-hidden rounded-[3rem] bg-[#111] border border-white/10 shadow-md px-6 py-16 md:px-16 md:py-24 mt-24 mb-24 max-w-7xl">
            <div className="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
                <div className="z-10 max-w-xl text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#ff6b40] text-sm font-medium mb-6">
                        <MapPin className="w-4 h-4" /> Global Gym Tracking
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-6">
                        Train Anywhere. <span className="text-white/40">We Track It.</span>
                    </h1>
                    <p className="text-white/60 text-base md:text-lg mb-8 font-medium max-w-lg">
                        "Your discipline shouldn't stop when you travel." <br className="hidden md:block" />
                        Check into any gym worldwide. UeiDo tracks your global heatmap, saving your favorite spots and workout streaks no matter what city you're crushing it in.
                    </p>
                    <Button className="inline-flex items-center gap-2 rounded-full bg-[#ff6b40] hover:bg-[#ff6b40]/80 text-white px-8 py-6 text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,107,64,0.3)] hover:shadow-[0_0_30px_rgba(255,107,64,0.5)] border-none">
                        Start Tracking <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
                <div className="relative h-[200px] md:h-[400px] w-full max-w-xl">
                    <Globe className="absolute -bottom-10 md:-bottom-20 md:-right-20 scale-[1.3] md:scale-150" />
                </div>
            </div>
        </section>
    );
}

const GLOBE_CONFIG: COBEOptions = {
    width: 800,
    height: 800,
    onRender: () => { },
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 1, // Changed to 1 for dark mode globe
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [0.1, 0.1, 0.1], // Dark gray ocean
    markerColor: [255 / 255, 107 / 255, 64 / 255], // Theme orange
    glowColor: [0.05, 0.05, 0.05], // Very subtle glow
    markers: [
        { location: [14.5995, 120.9842], size: 0.03 },
        { location: [19.076, 72.8777], size: 0.1 },
        { location: [23.8103, 90.4125], size: 0.05 },
        { location: [30.0444, 31.2357], size: 0.07 },
        { location: [39.9042, 116.4074], size: 0.08 },
        { location: [-23.5505, -46.6333], size: 0.1 },
        { location: [19.4326, -99.1332], size: 0.1 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [34.6937, 135.5022], size: 0.05 },
        { location: [41.0082, 28.9784], size: 0.06 },
        { location: [51.5074, -0.1278], size: 0.08 }, // London
        { location: [48.8566, 2.3522], size: 0.07 }, // Paris
        { location: [35.6762, 139.6503], size: 0.1 }, // Tokyo
    ],
}

export function Globe({
    className,
    config = GLOBE_CONFIG,
}: {
    className?: string
    config?: COBEOptions
}) {
    let phi = 0
    let width = 0
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pointerInteracting = useRef(null)
    const pointerInteractionMovement = useRef(0)
    const [r, setR] = useState(0)

    const updatePointerInteraction = (value: any) => {
        pointerInteracting.current = value
        if (canvasRef.current) {
            canvasRef.current.style.cursor = value ? "grabbing" : "grab"
        }
    }

    const updateMovement = (clientX: any) => {
        if (pointerInteracting.current !== null) {
            const delta = clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta
            setR(delta / 200)
        }
    }

    const onRender = useCallback(
        (state: Record<string, any>) => {
            if (!pointerInteracting.current) phi += 0.005
            state.phi = phi + r
            state.width = width * 2
            state.height = width * 2
        },
        [r],
    )

    const onResize = () => {
        if (canvasRef.current) {
            width = canvasRef.current.offsetWidth
        }
    }

    useEffect(() => {
        window.addEventListener("resize", onResize)
        onResize()

        const globe = createGlobe(canvasRef.current!, {
            ...config,
            width: width * 2,
            height: width * 2,
            onRender,
        })

        setTimeout(() => (canvasRef.current!.style.opacity = "1"))
        return () => globe.destroy()
    }, [])

    return (
        <div
            className={cn(
                "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
                className,
            )}
        >
            <canvas
                className={cn(
                    "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
                )}
                ref={canvasRef}
                onPointerDown={(e) =>
                    updatePointerInteraction(
                        e.clientX - pointerInteractionMovement.current,
                    )
                }
                onPointerUp={() => updatePointerInteraction(null)}
                onPointerOut={() => updatePointerInteraction(null)}
                onMouseMove={(e) => updateMovement(e.clientX)}
                onTouchMove={(e) =>
                    e.touches[0] && updateMovement(e.touches[0].clientX)
                }
            />
        </div>
    )
}
