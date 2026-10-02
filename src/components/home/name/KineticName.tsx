"use client";

import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
    type MotionValue,
} from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useEffect, useRef, type RefObject } from "react";

import { NO_POINTER } from "@/lib/usePointerField";
import { NameText } from "./NameText";
import { NameVariantProps } from "./registry";

const WEIGHT_MIN = 100;
const WEIGHT_MAX = 650;

const POINTER_REACH = 300;

const SCROLL_SPEED = 1800;

const TRACKING_REST = -6;
const TRACKING_FAST = 13;

export function KineticName({
    lines,
    name,
    stage,
    pointerX,
    pointerY,
}: NameVariantProps) {
    const reduceMotion = useSafeReducedMotion();

    /*
     * Scroll progress itself isn't interesting here.
     * Its velocity is.
     */
    const { scrollY } = useScroll();

    const scrollVelocity = useVelocity(scrollY);

    const smoothScrollVelocity = useSpring(scrollVelocity, {
        stiffness: 180,
        damping: 30,
        mass: 0.5,
    });

    /*
     * Convert scroll velocity to 0 → 1.
     */
    const scrollSpeed = useTransform(() => {
        if (reduceMotion) return 0;

        return Math.min(1, Math.abs(smoothScrollVelocity.get()) / SCROLL_SPEED);
    });

    /*
     * -6px at rest → +13px at fast scrolling.
     */
    const letterSpacing = useTransform(
        scrollSpeed,
        [0, 1],
        [`${TRACKING_REST}px`, `${TRACKING_FAST}px`],
    );

    return (
        <motion.h1
            id="site-name"
            aria-label={name}
            style={{
                letterSpacing,
            }}
            className="
        font-display
        font-extrabold
        leading-[1]
        text-name
      "
        >
            <NameText
                lines={lines}
                renderChar={(char, index) => (
                    <KineticChar
                        key={index}
                        char={char}
                        stage={stage}
                        pointerX={pointerX}
                        pointerY={pointerY}
                        still={Boolean(reduceMotion)}
                    />
                )}
            />
        </motion.h1>
    );
}

interface KineticCharProps {
    char: string;
    stage: RefObject<HTMLElement | null>;
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    still: boolean;
}

function KineticChar({
    char,
    stage,
    pointerX,
    pointerY,
    still,
}: KineticCharProps) {
    const ref = useRef<HTMLSpanElement>(null);

    const centre = useRef({
        x: NO_POINTER,
        y: NO_POINTER,
    });

    useEffect(() => {
        const element = ref.current;
        const stageElement = stage.current;

        if (!element || !stageElement) return;

        const measure = () => {
            const a = element.getBoundingClientRect();
            const b = stageElement.getBoundingClientRect();

            centre.current = {
                x: a.left - b.left + a.width / 2,
                y: a.top - b.top + a.height / 2,
            };
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(stageElement);

        void document.fonts?.ready.then(measure);

        return () => observer.disconnect();
    }, [stage]);

    const weight = useTransform(() => {
        if (still) return WEIGHT_MAX;

        if (pointerX.get() <= NO_POINTER / 2) {
            return WEIGHT_MIN;
        }

        const dx = pointerX.get() - centre.current.x;
        const dy = pointerY.get() - centre.current.y;

        const distance = Math.hypot(dx, dy);

        const influence = Math.max(0, 1 - distance / POINTER_REACH);

        /*
         * Squaring gives a more localized "hot spot" around the
         * pointer rather than making every character equally heavy.
         */
        const amount = influence * influence;

        return WEIGHT_MIN + (WEIGHT_MAX - WEIGHT_MIN) * amount;
    });

    const variation = useTransform(
        weight,
        (value) => `"wght" ${Math.round(value)}`,
    );

    return (
        <motion.span
            ref={ref}
            style={{
                fontVariationSettings: variation,
            }}
            className="
        inline-block
        [font-variation-settings:'wght'_300]
      "
        >
            {char}
        </motion.span>
    );
}
