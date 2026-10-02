"use client";

import "lenis/dist/lenis.css";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";

/**
 * Registered at module level so ScrollTrigger exists before any child
 * component creates a trigger in its own effect. Child effects run before this
 * provider's effects.
 */
gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => false;

/** Ease-out quart: fast departure, long soft landing. Used for every snap glide. */
const snapEasing = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Renders nothing. Binds the Lenis instance to GSAP so the two share one clock:
 *
 * 1. Lenis moves the page, so every time it scrolls we tell ScrollTrigger to
 *    re-read the scroll position.
 * 2. Lenis is not allowed to run its own requestAnimationFrame loop (autoRaf is
 *    off). Instead the GSAP ticker calls lenis.raf on every tick, so scroll,
 *    ScrollTrigger and any GSAP tween are updated in the same frame.
 * 3. GSAP lag smoothing is disabled. By default GSAP hides long frames by
 *    slowing its clock, which would make scroll-linked animation drift away
 *    from the real scroll position after a hitch.
 *
 * It also returns to the top and refreshes ScrollTrigger when the route changes.
 *
 * Reduced motion leaves the wheel native; everything else about the bridge
 * (GSAP sync, route reset) still runs, since those do not move the page
 * themselves.
 */
function LenisGsapBridge() {
    const lenis = useLenis();
    const pathname = usePathname();
    const previousPathname = useRef(pathname);

    useEffect(() => {
        if (!lenis) return;

        const onScroll = () => ScrollTrigger.update();
        lenis.on("scroll", onScroll);

        const onTick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.off("scroll", onScroll);
            gsap.ticker.remove(onTick);
            // Restore GSAP's documented defaults (threshold 500 ms, adjusted lag 33 ms).
            gsap.ticker.lagSmoothing(500, 33);
        };
    }, [lenis]);

    useEffect(() => {
        if (previousPathname.current === pathname) return;
        previousPathname.current = pathname;
        lenis?.scrollTo(0, { immediate: true, force: true });
        ScrollTrigger.refresh();
    }, [pathname, lenis]);

    return null;
}

interface SmoothScrollProviderProps {
    children: ReactNode;
}

/**
 * Site-wide smooth scrolling. Lenis is mounted on the root (the window), so
 * native scroll position, sticky elements and Motion's useScroll all keep
 * working. With prefers-reduced-motion the wheel is left native and section
 * locking is switched off: the same tree stays mounted, only the smoothing and
 * snapping turn off, so nothing remounts.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    const reduceMotion = useSyncExternalStore(
        subscribeToReducedMotion,
        getReducedMotion,
        getServerReducedMotion,
    );

    return (
        <ReactLenis
            root
            options={{
                autoRaf: false,
                // A low lerp is a long, liquid trail behind the input rather than a
                // quick catch-up, which is what gives the scroll its fluid feel.
                lerp: 0.07,
                duration: 1.2,
                easing: (t: number) => 1 - Math.pow(1 - t, 4),
                smoothWheel: !reduceMotion,
            }}
        >
            <LenisGsapBridge />
            {children}
        </ReactLenis>
    );
}
