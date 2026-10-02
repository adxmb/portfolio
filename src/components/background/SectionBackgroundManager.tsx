"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { ImageAsset } from "@/config/portfolioData";
import { useHomePreview } from "@/components/home/HomePreviewContext";
import { BlurTransition } from "./BlurTransition";
import { MaskTransition } from "./MaskTransition";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/** How much of a screen height the crossfade between two sections spans, centred on the boundary between them. */
const WINDOW_FRACTION = 0.6;

/** Pixel measurements this manager needs. Recomputed on resize; a plain React state, since it changes rarely, not every frame. */
interface Layout {
    /** Trigger scroll position for the transition into section i+1, one entry per gap between sections. */
    boundaries: number[];
    /** Top of the first marked section, in page pixels. Used to fade the layer in. */
    firstTop: number;
    /** Bottom of the last marked section, in page pixels. Used to fade the layer out. */
    lastBottom: number;
    /** Screen height at measurement time. */
    viewport: number;
}

const INITIAL_LAYOUT: Layout = {
    boundaries: [],
    firstTop: 0,
    lastBottom: 0,
    viewport: 900,
};

/**
 * Measures every element carrying data-bg-section, in document order, and
 * returns the layout the background manager needs. Called on mount, on resize,
 * after fonts load and on route change, since all of these can move the
 * sections without necessarily firing a resize event.
 */
function measure(): Layout {
    const elements = [
        ...document.querySelectorAll<HTMLElement>("[data-bg-section]"),
    ];
    const viewport = window.innerHeight;
    if (elements.length === 0) return { ...INITIAL_LAYOUT, viewport };

    const tops = elements.map(
        (element) => element.getBoundingClientRect().top + window.scrollY,
    );
    const last = elements[elements.length - 1];
    const lastRect = last.getBoundingClientRect();

    return {
        // The transition into section i+1 is centred on the midpoint between the two sections' tops.
        boundaries: tops.slice(1).map((top, index) => (top + tops[index]) / 2),
        firstTop: tops[0],
        lastBottom: lastRect.top + window.scrollY + lastRect.height,
        viewport,
    };
}

interface SectionBackgroundManagerProps {
    /** One image per section, in the same order the sections render (matched to data-bg-section elements by position). */
    images: ImageAsset[];
    /** 0 to 1. How strongly the page colour covers the images so text stays readable. */
    scrimOpacity: number;
    /** The sections themselves. Each must carry data-bg-section, in the same order as images. */
    children: ReactNode;
}

/**
 * Gives every section in `children` its own background image and plays the
 * selected transition (mask, blur, RGB split or radial) as the scroll position
 * crosses from one section into the next.
 *
 * Rather than stacking one transition layer per section boundary, which would
 * need careful opacity bookkeeping to stop a later, fully-settled layer from
 * covering an earlier one still mid-transition, this renders exactly one
 * transition at a time: whichever pair of sections the scroll position
 * currently sits between. The two are visually identical at the moment of
 * handover (both show the same "current" image at that scroll position), so
 * switching which pair is mounted there is seamless. Which segment is active
 * is plain React state, updated only when the scroll position actually crosses
 * a boundary, so this never re-renders on every scroll tick; the smooth motion
 * within a segment runs on a motion value.
 */
export function SectionBackgroundManager({
    images,
    scrimOpacity,
    children,
}: SectionBackgroundManagerProps) {
    const { backgroundTransition } = useHomePreview();
    const reduceMotion = useSafeReducedMotion();
    const [layout, setLayout] = useState<Layout>(INITIAL_LAYOUT);
    const [segment, setSegment] = useState(0);

    useEffect(() => {
        const remeasure = () => setLayout(measure());
        remeasure();

        let timer: number | undefined;
        const scheduled = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(remeasure, 160);
        };

        const observer = new ResizeObserver(scheduled);
        observer.observe(document.body);
        window.addEventListener("resize", scheduled);
        void document.fonts?.ready.then(scheduled);

        return () => {
            window.clearTimeout(timer);
            observer.disconnect();
            window.removeEventListener("resize", scheduled);
        };
    }, []);

    const half = (layout.viewport * WINDOW_FRACTION) / 2;
    const { scrollY } = useScroll();

    useEffect(() => {
        const update = () => {
            const y = scrollY.get();
            const next = layout.boundaries.filter(
                (boundary) => y >= boundary - half,
            ).length;
            setSegment((current) => (current === next ? current : next));
        };
        update();
        return scrollY.on("change", update);
    }, [scrollY, layout, half]);

    const activeBoundary =
        segment > 0 ? layout.boundaries[segment - 1] : undefined;
    const rawProgress = useTransform(
        scrollY,
        activeBoundary === undefined
            ? [0, 1]
            : [activeBoundary - half, activeBoundary + half],
        activeBoundary === undefined ? [0, 0] : [0, 1],
        { clamp: true },
    );
    const progress = useTransform(() =>
        reduceMotion ? (segment === 0 ? 0 : 1) : rawProgress.get(),
    );

    const layerOpacity = useTransform(() => {
        const { firstTop, lastBottom, viewport } = layout;
        const y = scrollY.get();
        const fade = viewport * 0.4;
        if (y < firstTop - fade) return 0;
        if (y < firstTop) return (y - (firstTop - fade)) / fade;
        if (y > lastBottom + fade) return 0;
        if (y > lastBottom) return 1 - (y - lastBottom) / fade;
        return 1;
    });

    const from = images[Math.max(0, segment - 1)];
    const to = images[Math.min(images.length - 1, segment)];
    const pair: [ImageAsset, ImageAsset] = [from, to];

    return (
        <>
            <motion.div
                aria-hidden="true"
                style={{ opacity: layerOpacity }}
                className="pointer-events-none fixed inset-0 z-[var(--z-backdrop)] overflow-hidden bg-canvas"
            >
                {backgroundTransition === "mask" ? (
                    <MaskTransition progress={progress} images={pair} />
                ) : null}
                {backgroundTransition === "blur" ? (
                    <BlurTransition progress={progress} images={pair} />
                ) : null}
                <div
                    className="absolute inset-0 bg-canvas"
                    style={{ opacity: scrimOpacity }}
                />
            </motion.div>
            {children}
        </>
    );
}
