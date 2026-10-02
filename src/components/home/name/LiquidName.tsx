"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValueEvent,
    useSpring,
    useTransform,
    useVelocity,
    type MotionValue,
} from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { TRACK_SPRING } from "@/lib/motion";
import { NO_POINTER } from "@/lib/usePointerField";
import { NameText } from "./NameText";
import { NameVariantProps } from "./registry";

/** Font weight of a letter far from the pointer and of one directly under it. Cabinet Grotesk is variable, 100 to 800. */
const WEIGHT_REST = 540;
const WEIGHT_PEAK = 720;
/** How far, in pixels, the pointer's influence on weight reaches. */
const REACH = 1024;
/** Pointer speed, in pixels per second, at which every effect is at full strength. */
const FULL_SPEED = 1040;
/** Speed (0 to 1) below which the warp filter is switched off entirely, so a resting name costs nothing. */
const WARP_THRESHOLD = 0;
/** Strongest displacement of the warp, in pixels. */
const BASE_WARP_STRENGTH = 12;
const MOVEMENT_WARP_STRENGTH = 88;

/**
 * Option B: kinetic text liquification.
 *
 * The name responds to how fast the pointer is moving, not just where it is.
 * Pointer velocity is measured, then spring-smoothed into a single "speed" from
 * 0 (still) to 1 (fast). Speed and direction drive four effects together:
 *
 * - Tracking: letters spread apart as speed rises, and draw back together after.
 * - Weight skew: the whole name leans in the direction of travel (a horizontal
 *   skew), while each letter's font weight swells around the pointer.
 * - Chromatic aberration: a red and a blue-green copy of the text separate
 *   along the direction of travel, like a lens failing at the edges.
 * - Warp: an SVG turbulence displacement filter wobbles the letter shapes, with
 *   its strength set by speed and its noise slowly drifting. The filter is only
 *   attached while the pointer is actually moving.
 *
 * With no pointer nothing moves and the name rests at a firm weight. Reduced
 * motion sets a fixed heavy weight and applies no effects.
 */
export function LiquidName({
    lines,
    name,
    stage,
    pointerX,
    pointerY,
}: NameVariantProps) {
    const reduceMotion = useSafeReducedMotion();
    const turbulence = useRef<SVGFETurbulenceElement>(null);
    const displacement = useRef<SVGFEDisplacementMapElement>(null);

    const smoothX = useSpring(pointerX, TRACK_SPRING);
    const smoothY = useSpring(pointerY, TRACK_SPRING);

    // A pointer that appears from nowhere (NO_POINTER to a real position) is a jump, not a fast movement, so it is ignored.
    const velocityX = useSpring(useVelocity(pointerX), {
        stiffness: 220,
        damping: 30,
    });
    const velocityY = useSpring(useVelocity(pointerY), {
        stiffness: 220,
        damping: 30,
    });
    const speed = useTransform(() => {
        if (reduceMotion || pointerX.get() <= NO_POINTER / 2) return 0;
        return Math.min(
            1,
            Math.hypot(velocityX.get(), velocityY.get()) / FULL_SPEED,
        );
    });

    const tracking = useTransform(
        () => `${(-0.05 + speed.get() * 0.18).toFixed(4)}em`,
    );
    // Moving right leans the top of the letters right, which is a negative skew.
    const skewX = useTransform(() =>
        Math.max(
            -16,
            Math.min(16, (-velocityX.get() / 130) * (speed.get() > 0 ? 1 : 0)),
        ),
    );
    const shadow = useTransform(() => {
        const s = speed.get();
        if (s < 0.03) return "0px 0px 0px transparent";
        const ox = Math.max(-10, Math.min(10, velocityX.get() / 230));
        const oy = Math.max(-6, Math.min(6, velocityY.get() / 320));
        const alpha = Math.min(0.9, s * 1.8).toFixed(2);
        // Chromatic fringes. These two colours only appear while the pointer moves.
        return `${ox.toFixed(1)}px ${oy.toFixed(1)}px 0 rgba(255, 68, 46, ${alpha}), ${(-ox).toFixed(1)}px ${(-oy).toFixed(1)}px 0 rgba(48, 190, 214, ${alpha})`;
    });

    const filter = useTransform(speed, (s) => "url(#name-liquid-warp)");

    useMotionValueEvent(speed, "change", (value) => {
        displacement.current?.setAttribute(
            "scale",
            String(
                Math.round(BASE_WARP_STRENGTH + value * MOVEMENT_WARP_STRENGTH),
            ),
        );
    });

    useAnimationFrame((time) => {
        if (pointerX.get() <= NO_POINTER / 2) return;

        const fx = 0.008 + Math.sin(time / 900) * 0.002;
        const fy = 0.016 + Math.cos(time / 1100) * 0.003;

        turbulence.current?.setAttribute(
            "baseFrequency",
            `${fx.toFixed(4)} ${fy.toFixed(4)}`,
        );
    });

    return (
        <>
            <svg
                aria-hidden="true"
                focusable="false"
                className="pointer-events-none absolute h-0 w-0"
            >
                <filter
                    id="name-liquid-warp"
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                    colorInterpolationFilters="sRGB"
                >
                    <feTurbulence
                        ref={turbulence}
                        type="fractalNoise"
                        baseFrequency="0.008 0.016"
                        numOctaves={2}
                        seed={7}
                        result="noise"
                    />
                    <feDisplacementMap
                        ref={displacement}
                        in="SourceGraphic"
                        in2="noise"
                        scale={BASE_WARP_STRENGTH}
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            <motion.h1
                id="site-name"
                aria-label={name}
                style={{
                    letterSpacing: tracking,
                    skewX,
                    textShadow: shadow,
                    filter,
                }}
                className="font-display text-name font-extrabold"
            >
                <NameText
                    lines={lines}
                    renderChar={(char) => (
                        <LiquidChar
                            char={char}
                            stage={stage}
                            pointerX={smoothX}
                            pointerY={smoothY}
                            still={Boolean(reduceMotion)}
                        />
                    )}
                />
            </motion.h1>
        </>
    );
}

interface LiquidCharProps {
    char: string;
    stage: RefObject<HTMLElement | null>;
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    still: boolean;
}

function LiquidChar({
    char,
    stage,
    pointerX,
    pointerY,
    still,
}: LiquidCharProps) {
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

    const weight = useTransform(() => {
        if (still) return WEIGHT_PEAK;
        const dx = pointerX.get() - centre.current.x;
        const dy = (pointerY.get() - centre.current.y) * 1.2;
        const closeness = Math.max(0, 1 - Math.hypot(dx, dy) / REACH);
        return (
            WEIGHT_REST + (WEIGHT_PEAK - WEIGHT_REST) * closeness * closeness
        );
    });
    const variation = useTransform(
        weight,
        (value) => `"wght" ${Math.round(value)}`,
    );

    return (
        <motion.span
            ref={ref}
            style={{ fontVariationSettings: variation }}
            className="inline-block"
        >
            {char}
        </motion.span>
    );
}
