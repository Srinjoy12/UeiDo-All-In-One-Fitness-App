import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DownloadSimple, ArrowRight } from '@phosphor-icons/react';
import { ShimmerButton } from './shimmer-button';

// ── Frame config ──────────────────────────────────────────────────
const FRAME_COUNT = 40;
const FRAME_DIR = '/ezgif-41b617e9064cb062-jpg';
const framePath = (i: number) =>
    `${FRAME_DIR}/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;

// ── Storytelling beats mapped to scroll progress (0‑1) ───────────
interface Beat {
    id: string;
    range: [number, number];       // [start, end] as fraction of total scroll
    align: 'left' | 'center' | 'right';
    headline: string;
    subtitle?: string;
    body?: string;
    bullets?: string[];
    cta?: boolean;
}

const BEATS: Beat[] = [
    {
        id: 'copilot',
        range: [0, 0.15],
        align: 'center',
        headline: 'Your Body. Our Brain.',
        subtitle: 'AI that trains with you, not at you.',
    },
    {
        id: 'brains',
        range: [0.15, 0.40],
        align: 'left',
        headline: 'Every Rep Calculated. Every Meal Mapped.',
        body: 'One intelligence. Zero guesswork.',
    },
    {
        id: 'ecosystem',
        range: [0.40, 0.65],
        align: 'right',
        headline: 'The Gym In Your Pocket.',
        body: 'Trainer. Dietitian. Coach. All in one tap.',
    },
    {
        id: 'progress',
        range: [0.65, 0.85],
        align: 'center',
        headline: 'Built Different. For The Discipline.',
        body: 'Not another fitness app. A system built for those who show up.',
    },
    {
        id: 'cta',
        range: [0.85, 1.0],
        align: 'center',
        headline: 'Stop Wishing. Start Lifting.',
        cta: true,
    },
];

// ── Helpers ───────────────────────────────────────────────────────
/** Clamp value between 0‑1 */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Ease-in-out for smooth opacity transitions */
const beatOpacity = (progress: number, [start, end]: [number, number]) => {
    const fadeIn = 0.04;   // 4% of total scroll to fade in
    const fadeOut = 0.04;  // 4% to fade out
    if (progress < start || progress > end) return 0;
    const inAlpha = clamp01((progress - start) / fadeIn);
    const outAlpha = clamp01((end - progress) / fadeOut);
    return Math.min(inAlpha, outAlpha);
};

// ══════════════════════════════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════════════════════════════
export const HeroScrollCanvas = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const rafRef = useRef<number>(0);
    const [loadProgress, setLoadProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);

    // ── Preload all frames ────────────────────────────────────────
    useEffect(() => {
        let loadedCount = 0;
        const imgs: HTMLImageElement[] = [];

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = framePath(i);
            img.onload = () => {
                loadedCount++;
                setLoadProgress(loadedCount / FRAME_COUNT);
                if (loadedCount === FRAME_COUNT) {
                    imagesRef.current = imgs;
                    setLoaded(true);
                }
            };
            imgs.push(img);
        }
    }, []);

    // ── Draw a frame onto the canvas ──────────────────────────────
    const drawFrame = useCallback((frameIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imagesRef.current[frameIndex];
        if (!img) return;

        // Set canvas to screen size for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        // Cover-fit the image
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = w / h;
        let drawW: number, drawH: number, dx: number, dy: number;
        if (imgRatio > canvasRatio) {
            drawH = h;
            drawW = h * imgRatio;
            dx = (w - drawW) / 2;
            dy = 0;
        } else {
            drawW = w;
            drawH = w / imgRatio;
            dx = 0;
            dy = (h - drawH) / 2;
        }
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, dx, dy, drawW, drawH);
    }, []);

    // ── Scroll‑driven animation loop ──────────────────────────────
    useEffect(() => {
        if (!loaded) return;

        // Draw first frame immediately
        drawFrame(0);

        const onScroll = () => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;

                const rect = container.getBoundingClientRect();
                const scrollableHeight = rect.height - window.innerHeight;
                const rawProgress = -rect.top / scrollableHeight;
                const progress = clamp01(rawProgress);

                // Map progress → frame index (0‑based)
                const frameIndex = Math.min(
                    FRAME_COUNT - 1,
                    Math.floor(progress * FRAME_COUNT)
                );
                drawFrame(frameIndex);
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // initial paint

        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(rafRef.current);
        };
    }, [loaded, drawFrame]);

    // ── Scroll progress for text overlays (driven in render) ──────
    const getProgress = () => {
        const container = containerRef.current;
        if (!container) return 0;
        const rect = container.getBoundingClientRect();
        const scrollableHeight = rect.height - window.innerHeight;
        return clamp01(-rect.top / scrollableHeight);
    };

    // Re-render text overlays on scroll
    const [scrollProgress, setScrollProgress] = useState(0);
    useEffect(() => {
        const onScroll = () => setScrollProgress(getProgress());
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Render ────────────────────────────────────────────────────
    return (
        <div ref={containerRef} className="hero-scroll-container">
            {/* Sticky viewport */}
            <div className="hero-scroll-sticky">
                {/* Loading overlay */}
                {!loaded && (
                    <div className="hero-scroll-loader">
                        <div className="hero-scroll-loader-bar">
                            <div
                                className="hero-scroll-loader-fill"
                                style={{ width: `${loadProgress * 100}%` }}
                            />
                        </div>
                        <p className="hero-scroll-loader-text">
                            Loading experience… {Math.round(loadProgress * 100)}%
                        </p>
                    </div>
                )}

                {/* Canvas */}
                <canvas ref={canvasRef} className="hero-scroll-canvas" />

                {/* Vignette overlay for depth */}
                <div className="hero-scroll-vignette" />

                {/* Text beats */}
                {BEATS.map((beat) => {
                    const opacity = beatOpacity(scrollProgress, beat.range);
                    if (opacity <= 0) return null;

                    const translateY = (1 - opacity) * 40; // slide up as it appears

                    return (
                        <div
                            key={beat.id}
                            className={`hero-scroll-beat hero-scroll-beat--${beat.align}`}
                            style={{
                                opacity,
                                transform: `translateY(${translateY}px)`,
                                pointerEvents: opacity > 0.5 ? 'auto' : 'none',
                            }}
                        >
                            <h2 className="hero-scroll-beat__headline">
                                {beat.headline}
                            </h2>

                            {beat.subtitle && (
                                <p className="hero-scroll-beat__subtitle">
                                    {beat.subtitle}
                                </p>
                            )}

                            {beat.body && (
                                <p className="hero-scroll-beat__body">
                                    {beat.body}
                                </p>
                            )}

                            {beat.bullets && (
                                <ul className="hero-scroll-beat__bullets">
                                    {beat.bullets.map((b, i) => (
                                        <li key={i}>{b}</li>
                                    ))}
                                </ul>
                            )}

                            {beat.cta && (
                                <div className="hero-scroll-beat__cta">
                                    <Link to="/signup">
                                        <ShimmerButton
                                            background="rgba(255, 107, 64, 1)"
                                            shimmerColor="#ffffff"
                                            shimmerSize="0.05em"
                                            className="shadow-2xl"
                                        >
                                            <span className="flex items-center gap-2 text-sm font-bold text-white">
                                                <DownloadSimple weight="bold" /> Download UeiDo
                                            </span>
                                        </ShimmerButton>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('how-it-works');
                                            el?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="hero-scroll-beat__secondary"
                                    >
                                        View Pro Features <ArrowRight weight="bold" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
