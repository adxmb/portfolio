"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
    motion,
    useSpring,
    useTransform,
    useVelocity,
    type MotionValue,
} from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { NO_POINTER } from "@/lib/usePointerField";
import { NameText } from "./NameText";
import { NameVariantProps } from "./registry";

/** How far, in pixels, a letter can feel the pointer. */
const REACH = 440;
/** Largest geometric offset of a fragment, in pixels, at full pointer speed. */
const MAX_OFFSET = 55;
/** Pointer speed, in pixels per second, at which the offset is at its strongest. */
const FULL_SPEED = 4200;

const TOP_COLOUR = "[" + "#FF0000" + "]";
const MID_COLOUR = "ink";
const BOTTOM_COLOUR = "[" + "#00FFFF" + "]";

/**
 * Option C: glitch displacement.
 *
 * Every letter is drawn three times, stacked: the real letter in the middle,
 * and two duplicates behind it in the accent colour and in a cool cyan, each
 * clipped to a few thin horizontal bands. When the pointer is near a letter and
 * moving, the bands slide a few pixels apart along the pointer's direction of
 * travel, so the letter appears to fragment along cut lines rather than blur
 * or smear. The offset is tiny (a handful of pixels) and geometric, which is
 * what keeps it feeling like a precise malfunction rather than noise.
 *
 * The offset comes from pointer speed, smoothed by a spring so it settles
 * rather than snapping, and it decays with distance from each letter, so the
 * fragmenting follows the cursor across the name. At rest, or far from every
 * letter, a letter is a single clean shape with no duplicates rendered.
 * Reduced motion renders only the plain letter.
 */
export function GlitchName({
    lines,
    name,
    stage,
    pointerX,
    pointerY,
}: NameVariantProps) {
    const reduceMotion = useSafeReducedMotion();

    return (
        <h1
            id="site-name"
            aria-label={name}
            className="font-display text-name font-extrabold"
        >
            <NameText
                lines={lines}
                renderChar={(char) => (
                    <GlitchChar
                        char={char}
                        stage={stage}
                        pointerX={pointerX}
                        pointerY={pointerY}
                        still={Boolean(reduceMotion)}
                    />
                )}
            />
        </h1>
    );
}

interface GlitchCharProps {
    char: string;
    stage: RefObject<HTMLElement | null>;
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    still: boolean;
}

/** Which vertical band (0 to 1 of the letter's height) each duplicate is clipped to. */
const BANDS: Array<[number, number]> = [
    [0, 0.33],
    [0.33, 0.66],
    [0.66, 1],
];

function GlitchChar({
    char,
    stage,
    pointerX,
    pointerY,
    still,
}: GlitchCharProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const centre = useRef({ x: NO_POINTER, y: NO_POINTER });

    useEffect(() => {
        const element = ref.current;
        const stageElement = stage.current;
        if (!element || !stageElement) return;

        const measure = () => {
            if (element.offsetParent === stageElement) {
                centre.current = {
                    x: element.offsetLeft + element.offsetWidth / 2,
                    y: element.offsetTop + element.offsetHeight / 2,
                };
            } else {
                const a = element.getBoundingClientRect();
                const b = stageElement.getBoundingClientRect();
                centre.current = {
                    x: a.left - b.left + a.width / 2,
                    y: a.top - b.top + a.height / 2,
                };
            }
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(stageElement);
        void document.fonts?.ready.then(measure);
        return () => observer.disconnect();
    }, [stage]);

    const velocityX = useSpring(useVelocity(pointerX), {
        stiffness: 260,
        damping: 34,
    });
    const velocityY = useSpring(useVelocity(pointerY), {
        stiffness: 260,
        damping: 34,
    });

    const closeness = useTransform(() => {
        if (still) return 0;
        const dx = pointerX.get() - centre.current.x;
        const dy = pointerY.get() - centre.current.y;
        return Math.max(0, 1 - Math.hypot(dx, dy) / REACH);
    });
    const strength = useSpring(closeness, { stiffness: 220, damping: 20 });

    const offsetX = useTransform(() => {
        const speed = Math.min(
            1,
            Math.hypot(velocityX.get(), velocityY.get()) / FULL_SPEED,
        );
        return (
            (velocityX.get() >= 0 ? 1 : -1) *
            speed *
            strength.get() *
            MAX_OFFSET
        );
    });
    const offsetY = useTransform(() => {
        const speed = Math.min(
            1,
            Math.hypot(velocityX.get(), velocityY.get()) / FULL_SPEED,
        );
        return (
            (velocityY.get() >= 0 ? 1 : -1) *
            speed *
            strength.get() *
            (MAX_OFFSET * 0.5)
        );
    });
    const layerOpacity = useTransform(strength, [0, 0.15, 1], [0, 0, 0.85]);

    return (
        <span ref={ref} className="relative inline-block">
            {/* The clean base letter. Always fully opaque, so the shape never disappears. */}
            <span className="relative">{char}</span>

            {BANDS.map(([start, end], index) => (
                <GlitchBand
                    key={index}
                    char={char}
                    start={start}
                    end={end}
                    direction={index % 2 === 0 ? 1 : -1}
                    tint={
                        index === 0
                            ? `text-${TOP_COLOUR}`
                            : index === 1
                              ? `text-${MID_COLOUR}`
                              : `text-${BOTTOM_COLOUR}`
                    }
                    offsetX={offsetX}
                    offsetY={offsetY}
                    opacity={layerOpacity}
                />
            ))}
        </span>
    );
}

interface GlitchBandProps {
    char: string;
    start: number;
    end: number;
    direction: 1 | -1;
    tint: string;
    offsetX: MotionValue<number>;
    offsetY: MotionValue<number>;
    opacity: MotionValue<number>;
}

/** One coloured, band-clipped duplicate of a letter. Its own component, so each of the three bands calls useTransform in a stable position rather than inside a loop. */
function GlitchBand({
    char,
    start,
    end,
    direction,
    tint,
    offsetX,
    offsetY,
    opacity,
}: GlitchBandProps) {
    const x = useTransform(() => offsetX.get() * direction);
    const y = useTransform(() => offsetY.get() * direction);

    return (
        <motion.span
            aria-hidden="true"
            style={{
                x,
                y,
                opacity,
                clipPath: `inset(${(start * 100).toFixed(1)}% 0 ${((1 - end) * 100).toFixed(1)}% 0)`,
            }}
            className={`pointer-events-none absolute inset-0 select-none ${tint}`}
        >
            {char}
        </motion.span>
    );
}
