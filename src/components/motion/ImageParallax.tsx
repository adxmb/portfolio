"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import type { ImageAsset } from "@/config/portfolioData";
import { ImageSlot } from "@/components/ui/ImageSlot";

interface ImageParallaxProps {
    image: ImageAsset;
    sizes?: string;
}

/**
 * A frame whose image drifts slowly upward inside it as the page scrolls past.
 * Vertical only, driven by scroll position through motion values, so it never
 * re-renders React. The image is enlarged 14% so the drift never exposes an
 * edge. Placeholder frames and reduced-motion users get a still frame, so the
 * placeholder text stays readable.
 */
export function ImageParallax({ image, sizes }: ImageParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);
    const reduceMotion = useSafeReducedMotion();
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const moves = image.src !== "" && !reduceMotion;
    const y = useTransform(
        scrollYProgress,
        [0, 1],
        moves ? ["-6%", "6%"] : ["0%", "0%"],
    );

    return (
        <div
            ref={ref}
            className="relative overflow-hidden shadow-[0_0_0_1px_var(--hairline)]"
        >
            <motion.div style={{ y, scale: moves ? 1.14 : 1 }}>
                <ImageSlot image={image} sizes={sizes} />
            </motion.div>
        </div>
    );
}
