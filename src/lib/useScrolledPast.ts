"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

/**
 * True once the page has scrolled past the given fraction of the viewport
 * height. It only re-renders when the answer flips, not on every scroll tick.
 * It also checks on mount, so a page reloaded halfway down is already correct.
 */
export function useScrolledPast(fraction: number): boolean {
  const { scrollY } = useScroll();
  const [past, setPast] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setPast(latest > window.innerHeight * fraction);
  });

  useEffect(() => {
    setPast(window.scrollY > window.innerHeight * fraction);
  }, [fraction]);

  return past;
}
