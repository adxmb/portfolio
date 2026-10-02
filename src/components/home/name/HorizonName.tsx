"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { NameText } from "./NameText";
import { NameVariantProps } from "./registry";

/** Degrees each letter starts rotated back on the X axis, and pixels it starts below its resting line. */
const START_ROTATE = 95;
const START_Y = 46;
/** How many milliseconds pass between one letter starting and the next. */
const STEP_MS = 45;

/**
 * Option D: horizon reveal.
 *
 * Every letter starts tipped back flat, as if lying on the ground behind a
 * horizon line, and hidden by a clipping mask at that line. Letters rotate up
 * out of the mask on the X axis, nearest letters first, until they stand
 * upright and reach their resting position. This plays once, timed by simple
 * proximity: the moment the page loads and the name's box is measured, so it
 * is a load-in choreography rather than a pointer or scroll effect, unlike the
 * other three options.
 *
 * Each letter's own perspective and transform-origin keep it hinging at its
 * own base rather than the whole word's, so the letters rise independently
 * instead of the name tipping up as one card.
 *
 * Reduced motion places every letter directly in its resting position with no
 * animation.
 */
export function HorizonName({ lines, name }: NameVariantProps) {
    const reduceMotion = useSafeReducedMotion();
    const [revealed, setRevealed] = useState(Boolean(reduceMotion));

    useEffect(() => {
        if (reduceMotion) return;
        const frame = requestAnimationFrame(() => setRevealed(true));
        return () => cancelAnimationFrame(frame);
    }, [reduceMotion]);

    return (
        <h1
            id="site-name"
            aria-label={name}
            className="font-display text-name font-extrabold"
        >
            <NameText
                lines={lines}
                renderChar={(char, index) => (
                    <HorizonChar
                        char={char}
                        index={index}
                        revealed={revealed}
                        still={Boolean(reduceMotion)}
                    />
                )}
            />
        </h1>
    );
}

interface HorizonCharProps {
    char: string;
    index: number;
    revealed: boolean;
    still: boolean;
}

function HorizonChar({ char, index, revealed, still }: HorizonCharProps) {
    return (
        <span className="inline-block overflow-hidden pb-[0.1em] align-top [perspective:600px]">
            <motion.span
                initial={
                    still
                        ? false
                        : { rotateX: START_ROTATE, y: START_Y, opacity: 0 }
                }
                animate={
                    revealed ? { rotateX: 0, y: 0, opacity: 1 } : undefined
                }
                transition={{
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                    delay: (index * STEP_MS) / 1000,
                }}
                style={{ transformOrigin: "50% 100%" }}
                className="inline-block [transform-style:preserve-3d]"
            >
                {char}
            </motion.span>
        </span>
    );
}
