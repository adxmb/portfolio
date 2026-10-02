"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

import { NO_POINTER } from "@/lib/usePointerField";
import { NameText } from "./NameText";
import { NameVariantProps } from "./registry";

const FIELD_TILT_X = 16;
const FIELD_TILT_Y = 11;
const DEPTH = 22;

const STIFFNESS = 40;
const DAMPING = 20;
const MASS = 0.4;

export function DepthName({
    lines,
    name,
    stage,
    pointerX,
    pointerY,
}: NameVariantProps) {
    const reduceMotion = useSafeReducedMotion();

    const fieldX = useSpring(
        useTransform(() => {
            if (pointerX.get() <= NO_POINTER / 2) return 0;

            return Math.max(
                -0.5,
                Math.min(
                    0.5,
                    pointerX.get() / (stage.current?.offsetWidth || 1) - 0.5,
                ),
            );
        }),
        {
            stiffness: STIFFNESS,
            damping: DAMPING,
            mass: MASS,
        },
    );

    const fieldY = useSpring(
        useTransform(() => {
            if (pointerY.get() <= NO_POINTER / 2) return 0;

            return Math.max(
                -0.5,
                Math.min(
                    0.5,
                    pointerY.get() / (stage.current?.offsetHeight || 1) - 0.5,
                ),
            );
        }),
        {
            stiffness: STIFFNESS,
            damping: DAMPING,
            mass: MASS,
        },
    );

    const rotateY = useTransform(
        fieldX,
        [-0.5, 0.5],
        reduceMotion ? [0, 0] : [-FIELD_TILT_Y, FIELD_TILT_Y],
    );

    const rotateX = useTransform(
        fieldY,
        [-0.5, 0.5],
        reduceMotion ? [0, 0] : [FIELD_TILT_X, -FIELD_TILT_X],
    );

    return (
        <motion.h1
            id="site-name"
            aria-label={name}
            style={{
                rotateX,
                rotateY,
            }}
            className="
        relative
        font-display
        font-extrabold
        leading-[1]
        [transform-style:preserve-3d]
        text-name
      "
        >
            {/* Accent copy */}
            <div
                aria-hidden="true"
                className="
          pointer-events-none
          absolute
          inset-0
          select-none
          text-[var(--accent)]
          [transform:translate3d(0.015em,0.015em,-15px)]
          [transform-style:preserve-3d]
        "
            >
                <NameText
                    lines={lines}
                    renderChar={(char, index) => (
                        <span key={index} className="inline-block">
                            {char}
                        </span>
                    )}
                />
            </div>

            {/* Main three-dimensional type */}
            <div
                className="
          relative
          [transform-style:preserve-3d]
        "
            >
                <NameText
                    lines={lines}
                    renderChar={(char, index) => (
                        <DepthChar key={index} char={char} index={index} />
                    )}
                />
            </div>
        </motion.h1>
    );
}

interface DepthCharProps {
    char: string;
    index: number;
}

function DepthChar({ char, index }: DepthCharProps) {
    /*
     * Alternate the depth slightly between lines/characters so the
     * headline doesn't read as one completely flat plane.
     */

    return (
        <span
            className="
        inline-block
        [transform-style:preserve-3d]
        will-change-transform
      "
            style={{
                transform: `translateZ(${DEPTH}px)`,
            }}
        >
            {char}
        </span>
    );
}
