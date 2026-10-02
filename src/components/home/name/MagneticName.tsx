"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
    motion,
    useSpring,
    useTransform,
    type MotionValue,
} from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { NO_POINTER } from "@/lib/usePointerField";
import { NameText } from "./NameText";
import { NameVariantProps } from "./registry";

/** How far, in pixels, a letter can feel the pointer. Letters are huge, so this is generous. */
const REACH = 620;
/** Largest sideways and vertical pull toward the pointer, in pixels. */
const PULL_X = 13;
const PULL_Y = 7;
/** Largest lift toward the viewer, in pixels, for the letter nearest the pointer. */
const LIFT = 70;
/** Largest lean toward the pointer, in degrees. */
const LEAN = 32;
/** Largest tilt of the whole name, in degrees, as the pointer crosses the screen. */
const FIELD_TILT = 5;

/**
 * Option A: magnetic 3D letter split.
 *
 * Every letter is its own element in a shared 3D space. Each one works out how
 * close the pointer is, and a spring turns that closeness into a "pull" that
 * rises and settles with a little overshoot. The pull drives four things at
 * once: the letter slides toward the cursor, lifts toward the viewer, and
 * leans its face toward the cursor on both axes. Because every letter has its
 * own spring, with slightly different mass, they do not move in lockstep: a
 * wave of lean ripples through the name behind the pointer.
 *
 * The whole name also tilts gently as the pointer crosses the screen, which
 * gives the perspective field something to swing against.
 *
 * Nothing here uses React state, so it runs at full frame rate. When there is no
 * pointer, a slow ambient sweep stands in for one (supplied by usePointerField).
 * Reduced motion leaves the name flat and still.
 */
export function MagneticName({
    lines,
    name,
    stage,
    pointerX,
    pointerY,
}: NameVariantProps) {
    const reduceMotion = useSafeReducedMotion();

    // Where the pointer is across the stage, -0.5 to 0.5, smoothed. Zero when there is no pointer.
    const fieldX = useSpring(
        useTransform(() =>
            pointerX.get() <= NO_POINTER / 2
                ? 0
                : Math.max(
                      -0.5,
                      Math.min(
                          0.5,
                          pointerX.get() / (stage.current?.offsetWidth || 1) -
                              0.5,
                      ),
                  ),
        ),
        { mass: 0.6, stiffness: 60, damping: 18 },
    );
    const fieldY = useSpring(
        useTransform(() =>
            pointerY.get() <= NO_POINTER / 2
                ? 0
                : Math.max(
                      -0.5,
                      Math.min(
                          0.5,
                          pointerY.get() / (stage.current?.offsetHeight || 1) -
                              0.5,
                      ),
                  ),
        ),
        { mass: 0.6, stiffness: 60, damping: 18 },
    );
    const rotateY = useTransform(
        fieldX,
        [-0.5, 0.5],
        [reduceMotion ? 0 : -FIELD_TILT, reduceMotion ? 0 : FIELD_TILT],
    );
    const rotateX = useTransform(
        fieldY,
        [-0.5, 0.5],
        [
            reduceMotion ? 0 : FIELD_TILT * 0.7,
            reduceMotion ? 0 : -FIELD_TILT * 0.7,
        ],
    );

    return (
        <motion.h1
            id="site-name"
            aria-label={name}
            style={{ rotateX, rotateY }}
            className="font-display text-name font-extrabold [transform-style:preserve-3d]"
        >
            <NameText
                lines={lines}
                renderChar={(char, index) => (
                    <MagneticChar
                        char={char}
                        index={index}
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

interface MagneticCharProps {
    char: string;
    index: number;
    stage: RefObject<HTMLElement | null>;
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    still: boolean;
}

function MagneticChar({
    char,
    index,
    stage,
    pointerX,
    pointerY,
    still,
}: MagneticCharProps) {
    const ref = useRef<HTMLSpanElement>(null);
    // Centre of this letter in the stage's coordinates. Measured from layout, so transforms never feed back into it.
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

    const closeness = useTransform(() => {
        if (still) return 0;
        const dx = pointerX.get() - centre.current.x;
        const dy = pointerY.get() - centre.current.y;
        return Math.max(0, 1 - Math.hypot(dx, dy) / REACH);
    });

    // Each letter has its own slightly different mass, so they arrive and settle out of step with one another.
    const pull = useSpring(closeness, {
        stiffness: 150,
        damping: 13,
        mass: 0.5 + (index % 4) * 0.12,
    });

    /** Unit vector from this letter toward the pointer. */
    const direction = useTransform(() => {
        const dx = pointerX.get() - centre.current.x;
        const dy = pointerY.get() - centre.current.y;
        const length = Math.hypot(dx, dy) || 1;
        return { x: dx / length, y: dy / length };
    });

    const x = useTransform(() => direction.get().x * pull.get() * PULL_X);
    const y = useTransform(() => direction.get().y * pull.get() * PULL_Y);
    const z = useTransform(pull, [0, 1], [0, LIFT]);
    // To face a pointer on the right the letter turns its right edge away, which is a negative rotation about Y.
    const rotateY = useTransform(() => -direction.get().x * pull.get() * LEAN);
    const rotateX = useTransform(() => -direction.get().y * pull.get() * LEAN);

    return (
        <motion.span
            ref={ref}
            style={{ x, y, z, rotateX, rotateY }}
            className="inline-block will-change-transform [transform-style:preserve-3d]"
        >
            {char}
        </motion.span>
    );
}
