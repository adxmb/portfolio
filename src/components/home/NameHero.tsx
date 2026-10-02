"use client";

import { useMemo, useRef } from "react";
import {
    AnimatePresence,
    animate,
    motion,
    useScroll,
    useTransform,
} from "motion/react";
import { portfolio } from "@/config/portfolioData";
import { balanceLines } from "@/lib/text";
import { EASE_OUT } from "@/lib/motion";
import { usePointerField } from "@/lib/usePointerField";
import { useHomePreview } from "./HomePreviewContext";
import { NAME_VARIANTS } from "./name/registry";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * The first screen: the name, alone, centred both ways, and (for three of the
 * four variants) the site's one interactive element. The name is the page's h1.
 *
 * The whole screen is the pointer's workspace, so letters react to a cursor
 * anywhere on it, not only when it is over them. Which effect the name uses is
 * read from the preview context, whose starting value is
 * portfolio.home.nameVariant:
 * - "magnetic": 3D letters lean and lift toward the cursor.
 * - "liquid": weight, tracking, skew and colour fringing follow pointer speed.
 * - "glitch": thin coloured bands of each letter shift a few pixels apart,
 *   scaled by pointer speed and distance.
 * - "horizon": a one-time load animation, letters rotating up out of a mask.
 *   It ignores the pointer entirely.
 * Switching cross-fades the outgoing and incoming variant.
 *
 * The stage element is the coordinate system the pointer-driven variants
 * measure against. It carries the CSS perspective the magnetic variant needs.
 */
export function NameHero() {
    const { person, home } = portfolio;
    const { nameVariant } = useHomePreview();
    const reduceMotion = useSafeReducedMotion();

    const { scrollY } = useScroll();
    const arrowOpacity = useTransform(scrollY, [0, 120], [1, 0]);

    const areaRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const lines = useMemo(() => balanceLines(person.name, 3), [person.name]);

    const { Component, ambient } = NAME_VARIANTS[nameVariant];

    // Only the pointer-driven variants get the ambient sweep; horizon plays on its own timer regardless.
    const pointer = usePointerField(areaRef, stageRef, {
        ambient: nameVariant === "magnetic",
    });

    return (
        <section
            ref={areaRef}
            aria-labelledby="site-name"
            className="relative flex min-h-[100dvh] items-center justify-center px-4 text-center md:px-8"
        >
            <div
                ref={stageRef}
                className="relative touch-pan-y [perspective:1100px]"
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={nameVariant}
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT }}
                        className="[transform-style:preserve-3d]"
                    >
                        <Component
                            lines={lines}
                            name={person.name}
                            stage={stageRef}
                            pointerX={pointer.x}
                            pointerY={pointer.y}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
            <motion.div
                style={{ opacity: reduceMotion ? 1 : arrowOpacity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 md:bottom-12"
            >
                <button
                    type="button"
                    aria-label="Scroll hint arrow"
                    onClick={() => {
                        const target = window.innerHeight;
                        if (reduceMotion) {
                            window.scrollTo({ top: target, behavior: "auto" });
                            return;
                        }
                        const controls = animate(window.scrollY, target, {
                            duration: 1.4,
                            ease: EASE_OUT,
                            onUpdate: (value) => window.scrollTo(0, value),
                        });
                        const cancel = () => controls.stop();
                        window.addEventListener("wheel", cancel, {
                            once: true,
                        });
                        window.addEventListener("touchstart", cancel, {
                            once: true,
                        });
                    }}
                    className="block p-3 text-muted/50 transition-colors duration-300 hover:text-ink"
                >
                    <svg width="44" height="18" viewBox="0 0 44 18" fill="none">
                        <path
                            d="M3 3L22 15L41 3"
                            stroke="currentColor"
                            strokeWidth="4.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </motion.div>
        </section>
    );
}
