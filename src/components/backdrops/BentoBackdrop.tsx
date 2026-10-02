"use client";

import { useEffect, useRef } from "react";

/** Grid cell size in pixels. */
const CELL = 86;
/** Radius, in pixels, of the glow around the cursor's nearest border intersections. Matches the mask radius set on the element below. */
const GLOW_RADIUS = 360;

/**
 * Alternative Option 2: a quiet structural grid of hairlines, with a soft glow
 * that follows the cursor along the lines nearest it. No imagery, no motion
 * except the glow, and nothing to load: this is the cheapest of the three
 * backdrop options.
 *
 * The grid itself is a static CSS background (two repeating linear-gradients),
 * so it costs nothing to paint. The glow is a radial-gradient mask positioned
 * with a CSS custom property updated directly on the element from a
 * pointermove listener — deliberately not React state, so moving the mouse
 * never triggers a re-render.
 */
export function BentoBackdrop({ className = "" }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const onMove = (event: PointerEvent) => {
            const box = element.getBoundingClientRect();
            element.style.setProperty(
                "--glow-x",
                `${event.clientX - box.left}px`,
            );
            element.style.setProperty(
                "--glow-y",
                `${event.clientY - box.top}px`,
            );
            element.style.setProperty("--glow-opacity", "1");
        };
        const onLeave = () => element.style.setProperty("--glow-opacity", "0");

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerout", onLeave);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerout", onLeave);
        };
    }, []);

    return (
        <div
            ref={ref}
            aria-hidden="true"
            style={
                {
                    "--glow-x": "50%",
                    "--glow-y": "50%",
                    "--glow-opacity": 0,
                    "--glow-radius": `${GLOW_RADIUS}px`,
                    backgroundImage: [
                        `repeating-linear-gradient(to right, var(--hairline) 0 1px, transparent 1px ${CELL}px)`,
                        `repeating-linear-gradient(to bottom, var(--hairline) 0 1px, transparent 1px ${CELL}px)`,
                    ].join(", "),
                } as React.CSSProperties
            }
            className={`bento-glow pointer-events-none absolute inset-0 z-[var(--z-backdrop)] opacity-70 ${className}`}
        />
    );
}
