"use client";

import { useEffect, type RefObject } from "react";
import { animate, useMotionValue, type MotionValue } from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/** Far outside any element, meaning "no pointer yet". Nothing is within reach of it. */
export const NO_POINTER = -4000;

interface PointerFieldOptions {
    /**
     * When true, a slow sweep stands in for the pointer whenever there is none
     * (before the first move, after the pointer leaves, and on touch screens).
     */
    ambient?: boolean;
}

interface PointerField {
    /** Pointer x in pixels, relative to the stage's left edge. NO_POINTER when absent. */
    x: MotionValue<number>;
    /** Pointer y in pixels, relative to the stage's top edge. NO_POINTER when absent. */
    y: MotionValue<number>;
}

/**
 * Tracks the pointer across a whole area (the "workspace", here the full first
 * screen) and reports it in the coordinates of a smaller stage (the name), so
 * letters can react to a cursor that is nowhere near them.
 *
 * The values are motion values, so following the pointer never re-renders React.
 * Reduced motion turns tracking and the ambient sweep off, leaving the field
 * permanently empty.
 */
export function usePointerField(
    area: RefObject<HTMLElement | null>,
    stage: RefObject<HTMLElement | null>,
    { ambient = false }: PointerFieldOptions = {},
): PointerField {
    const reduceMotion = useSafeReducedMotion();
    const x = useMotionValue(NO_POINTER);
    const y = useMotionValue(NO_POINTER);

    useEffect(() => {
        const areaElement = area.current;
        const stageElement = stage.current;
        if (!areaElement || !stageElement || reduceMotion) return;

        let sweep: { stop: () => void } | null = null;

        const stopSweep = () => {
            sweep?.stop();
            sweep = null;
        };

        const startSweep = () => {
            if (!ambient || sweep) return;
            const width = stageElement.offsetWidth;
            y.set(stageElement.offsetHeight * 0.5);
            const from =
                x.get() < 0 || x.get() > width ? width * 0.05 : x.get();
            sweep = animate(x, [from, width * 0.95], {
                duration: 5.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror",
            });
        };

        const setFromEvent = (event: PointerEvent) => {
            stopSweep();
            const box = stageElement.getBoundingClientRect();
            x.set(event.clientX - box.left);
            y.set(event.clientY - box.top);
        };

        const onDown = (event: PointerEvent) => {
            setFromEvent(event);
        };

        const onMove = (event: PointerEvent) => {
            setFromEvent(event);
        };

        const onLeave = () => {
            if (ambient) startSweep();
            else {
                x.set(NO_POINTER);
                y.set(NO_POINTER);
            }
        };

        const onUp = () => onLeave();

        areaElement.addEventListener("pointerdown", onDown);
        areaElement.addEventListener("pointermove", onMove);
        areaElement.addEventListener("pointerleave", onLeave);
        areaElement.addEventListener("pointerup", onUp);
        areaElement.addEventListener("pointercancel", onUp);
        startSweep();

        return () => {
            areaElement.removeEventListener("pointerdown", onDown);
            areaElement.removeEventListener("pointermove", onMove);
            areaElement.removeEventListener("pointerleave", onLeave);
            areaElement.removeEventListener("pointerup", onUp);
            areaElement.removeEventListener("pointercancel", onUp);
            stopSweep();
        };
    }, [area, stage, ambient, reduceMotion, x, y]);

    return { x, y };
}
