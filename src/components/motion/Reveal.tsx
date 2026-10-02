"use client";

import { Fragment, type ReactNode } from "react";
import { motion } from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import {
    boundaryLine,
    revealContainer,
    revealItem,
    revealWord,
} from "@/lib/motion";

/** Reveal once, when the element is 12% of the viewport height inside the bottom edge. */
const VIEWPORT = { once: true, amount: 0.15 } as const;

interface RevealGroupProps {
    children: ReactNode;
    className?: string;
}

/**
 * Parent of a reveal sequence. Every RevealItem, RevealText word and
 * BoundaryLine inside it appears in document order, 70 ms apart.
 * With reduced motion the content is simply present.
 */
export function RevealGroup({ children, className }: RevealGroupProps) {
    const reduceMotion = useSafeReducedMotion();

    return (
        <motion.div
            className={className}
            variants={revealContainer}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={VIEWPORT}
        >
            {children}
        </motion.div>
    );
}

const MOTION_TAGS = {
    div: motion.div,
    li: motion.li,
    p: motion.p,
    article: motion.article,
} as const;

interface RevealItemProps {
    as?: keyof typeof MOTION_TAGS;
    children: ReactNode;
    className?: string;
}

/** A block that rises into place as part of its RevealGroup. */
export function RevealItem({
    as = "div",
    children,
    className,
}: RevealItemProps) {
    const Tag = MOTION_TAGS[as];

    return (
        <Tag className={className} variants={revealItem}>
            {children}
        </Tag>
    );
}

/**
 * Heading text where each word rises out of its own mask. Put it inside an
 * h2 inside a RevealGroup. The padding and negative margin keep descenders
 * (g, y, p) from being clipped by the mask.
 */
export function RevealText({ text }: { text: string }) {
    const words = text.split(" ");

    return (
        <>
            {words.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                    <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
                        <motion.span
                            className="inline-block"
                            variants={revealWord}
                        >
                            {word}
                        </motion.span>
                    </span>
                    {index < words.length - 1 ? " " : null}
                </Fragment>
            ))}
        </>
    );
}

/** The hairline that marks the top of a section, drawing in from the left. */
export function BoundaryLine() {
    return (
        <motion.span
            aria-hidden="true"
            className="block h-px w-full origin-left bg-hairline"
            variants={boundaryLine}
        />
    );
}
