import type { Transition, Variants } from "motion/react";

/** The house easing curve: fast start, long soft landing. */
export const EASE_OUT: [number, number, number, number] = [0.32, 0.72, 0, 1];

/**
 * Smoothing spring for scroll-bound motion (background transitions, the name
 * roll-out). Damping ratio is about 1.9, so it never overshoots: it only trails
 * the scroll position slightly, which reads as weight rather than lag.
 */
export const TRACK_SPRING = { mass: 0.2, stiffness: 80, damping: 15 } as const;

/**
 * Heavy spring for the sidequest orbit. Damping ratio is about 1.26, so the
 * ring glides to rest without bounce, and the extra mass makes a drag feel
 * like turning something with weight.
 */
export const ORBIT_SPRING = { mass: 0.9, stiffness: 70, damping: 20 } as const;

/** Snappy spring for small UI state changes, like the sliding nav indicator. */
export const UI_SPRING: Transition = {
    type: "spring",
    stiffness: 420,
    damping: 34,
};

/** Entry spring for revealed content. */
const REVEAL_SPRING: Transition = {
    type: "spring",
    stiffness: 110,
    damping: 20,
};

/** Parent variants: children reveal one after another. */
export const revealContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

/** A block of content rising into place. */
export const revealItem: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: REVEAL_SPRING },
};

/** A single word of a heading rising out of its mask. */
export const revealWord: Variants = {
    hidden: { y: "110%" },
    show: {
        y: "0%",
        transition: { type: "spring", stiffness: 140, damping: 22 },
    },
};

/** The hairline at the top of a section drawing in from the left. */
export const boundaryLine: Variants = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT } },
};
