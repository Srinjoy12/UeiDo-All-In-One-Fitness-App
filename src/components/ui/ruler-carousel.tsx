"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Rewind, FastForward } from "lucide-react";

export interface CarouselItem {
    id: number;
    title: string;
}

// Create infinite items by triplicating the array
const createInfiniteItems = (originalItems: CarouselItem[]) => {
    const items: { id: string; title: string; originalIndex: number }[] = [];
    for (let i = 0; i < 3; i++) {
        originalItems.forEach((item, index) => {
            items.push({
                ...item,
                id: `${i}-${item.id}`,
                originalIndex: index,
            });
        });
    }
    return items;
};

const RulerLines = ({
    top = true,
    totalLines = 100,
}: {
    top?: boolean;
    totalLines?: number;
}) => {
    const lines = [];
    const lineSpacing = 100 / (totalLines - 1);

    for (let i = 0; i < totalLines; i++) {
        const isFifth = i % 5 === 0;
        const isCenter = i === Math.floor(totalLines / 2);

        let height = "h-3";
        let color = "bg-white/20";

        if (isCenter) {
            height = "h-8";
            color = "bg-[#ff6b40]";
        } else if (isFifth) {
            height = "h-4";
            color = "bg-white/60";
        }

        const positionClass = top ? "" : "bottom-0";

        lines.push(
            <div
                key={i}
                className={`absolute w-0.5 ${height} ${color} ${positionClass}`}
                style={{ left: `${i * lineSpacing}%` }}
            />
        );
    }

    return <div className="relative w-full h-8 px-4">{lines}</div>;
};

export function RulerCarousel({
    originalItems,
}: {
    originalItems: CarouselItem[];
}) {
    const infiniteItems = createInfiniteItems(originalItems);
    const itemsPerSet = originalItems.length;

    // Start with the middle set, item 4
    const [activeIndex, setActiveIndex] = useState(itemsPerSet + 4);
    const [isResetting, setIsResetting] = useState(false);
    const previousIndexRef = useRef(itemsPerSet + 4);

    const handleItemClick = (newIndex: number) => {
        if (isResetting) return;

        const targetOriginalIndex = newIndex % itemsPerSet;

        const possibleIndices = [
            targetOriginalIndex,
            targetOriginalIndex + itemsPerSet,
            targetOriginalIndex + itemsPerSet * 2,
        ];

        let closestIndex = possibleIndices[0];
        let smallestDistance = Math.abs(possibleIndices[0] - activeIndex);

        for (const index of possibleIndices) {
            const distance = Math.abs(index - activeIndex);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestIndex = index;
            }
        }

        previousIndexRef.current = activeIndex;
        setActiveIndex(closestIndex);
    };

    const handlePrevious = () => {
        if (isResetting) return;
        setActiveIndex((prev) => prev - 1);
    };

    const handleNext = () => {
        if (isResetting) return;
        setActiveIndex((prev) => prev + 1);
    };

    // Handle infinite scrolling
    useEffect(() => {
        if (isResetting) return;

        if (activeIndex < itemsPerSet) {
            setIsResetting(true);
            setTimeout(() => {
                setActiveIndex(activeIndex + itemsPerSet);
                setIsResetting(false);
            }, 0);
        } else if (activeIndex >= itemsPerSet * 2) {
            setIsResetting(true);
            setTimeout(() => {
                setActiveIndex(activeIndex - itemsPerSet);
                setIsResetting(false);
            }, 0);
        }
    }, [activeIndex, itemsPerSet, isResetting]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isResetting) return;

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                setActiveIndex((prev) => prev - 1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                setActiveIndex((prev) => prev + 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isResetting]);

    const centerPosition = 5;
    const targetX = -500 + (centerPosition - (activeIndex % itemsPerSet)) * 500;

    const currentPage = (activeIndex % itemsPerSet) + 1;
    const totalPages = itemsPerSet;

    return (
        <div className="w-full py-24 flex flex-col items-center justify-center bg-[#0a0a0a]">
            <div className="w-full h-[200px] flex flex-col justify-center relative">
                <div className="flex items-center justify-center">
                    <RulerLines top />
                </div>
                <div className="flex items-center justify-center w-full h-full relative overflow-hidden">
                    <motion.div
                        className="flex items-center gap-[100px]"
                        animate={{
                            x: isResetting ? targetX : targetX,
                        }}
                        transition={
                            isResetting
                                ? { duration: 0 }
                                : {
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    mass: 1,
                                }
                        }
                    >
                        {infiniteItems.map((item, index) => {
                            const isActive = index === activeIndex;

                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => handleItemClick(index)}
                                    className={`text-4xl md:text-6xl font-black uppercase tracking-tighter whitespace-nowrap cursor-pointer flex items-center justify-center ${isActive
                                            ? "text-[#ff6b40]"
                                            : "text-white/20 hover:text-white/40"
                                        }`}
                                    animate={{
                                        scale: isActive ? 1 : 0.75,
                                        opacity: isActive ? 1 : 0.4,
                                    }}
                                    transition={
                                        isResetting
                                            ? { duration: 0 }
                                            : {
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 25,
                                            }
                                    }
                                    style={{
                                        width: "400px",
                                    }}
                                >
                                    {item.title}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>

                <div className="flex items-center justify-center">
                    <RulerLines top={false} />
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-10">
                <button
                    onClick={handlePrevious}
                    disabled={isResetting}
                    className="flex items-center justify-center cursor-pointer"
                    aria-label="Previous item"
                >
                    <Rewind className="w-5 h-5 text-[#ff6b40]/80" />
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/40">
                        {currentPage}
                    </span>
                    <span className="text-sm text-white/30">
                        /
                    </span>
                    <span className="text-sm font-medium text-white/40">
                        {totalPages}
                    </span>
                </div>

                <button
                    onClick={handleNext}
                    disabled={isResetting}
                    className="flex items-center justify-center cursor-pointer"
                    aria-label="Next item"
                >
                    <FastForward className="w-5 h-5 text-[#ff6b40]/80" />
                </button>
            </div>
        </div>
    );
}
