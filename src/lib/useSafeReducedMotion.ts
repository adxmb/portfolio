"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Like useReducedMotion, but never diverges from the server's render.
 * useReducedMotion reads matchMedia synchronously during render, which is
 * fine on its own but produces a hydration mismatch for anyone whose OS has
 * Reduce Motion enabled, since the server always assumes false. This forces
 * false until after mount, then re-renders once with the real value.
 */
export function useSafeReducedMotion(): boolean {
    const reduceMotion = useReducedMotion();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return mounted ? Boolean(reduceMotion) : false;
}
