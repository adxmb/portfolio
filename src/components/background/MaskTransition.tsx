"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { ImageAsset } from "@/config/portfolioData";
import { FillImage } from "@/components/ui/FillImage";

/** How far the wiping edge is tilted, in percent of the layer height. */
const SLANT = 16;

interface MaskTransitionProps {
    /** Scroll progress through the story, 0 to 1, already spring-smoothed. */
    progress: MotionValue<number>;
    images: [ImageAsset, ImageAsset];
}

/**
 * Transition type A: fluid parallax masking.
 *
 * The second image sits on top of the first, clipped by a polygon whose bottom
 * edge is a tilted line. As scroll progress goes from 0.2 to 0.8 that line
 * sweeps down the screen and the second image is uncovered behind it. While it
 * does, the two images drift vertically at different speeds, the first slowly
 * upward and the second rising from below, so the boundary reads as a moving
 * window between two depths rather than a flat wipe.
 *
 * Both images are scaled to 125% so the drift never exposes an edge.
 */
export function MaskTransition({ progress, images }: MaskTransitionProps) {
    const reveal = useTransform(progress, [0.2, 0.8], [0, 1]);
    const clipPath = useTransform(reveal, (t) => {
        const edge = t * (100 + SLANT);
        return `polygon(0% 0%, 100% 0%, 100% ${edge - SLANT}%, 0% ${edge}%)`;
    });
    const firstY = useTransform(progress, [0, 1], ["0%", "-9%"]);
    const secondY = useTransform(progress, [0, 1], ["11%", "0%"]);

    return (
        <>
            <motion.div
                style={{ y: firstY, scale: 1.25 }}
                className="absolute inset-0"
            >
                <FillImage
                    image={images[0]}
                    priority
                    sizes="100vw"
                    showLabel={false}
                />
            </motion.div>
            <motion.div style={{ clipPath }} className="absolute inset-0">
                <motion.div
                    style={{ y: secondY, scale: 1.25 }}
                    className="absolute inset-0"
                >
                    <FillImage
                        image={images[1]}
                        sizes="100vw"
                        showLabel={false}
                    />
                </motion.div>
            </motion.div>
        </>
    );
}
