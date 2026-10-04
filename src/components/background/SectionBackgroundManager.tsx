"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useHomePreview } from "@/components/home/HomePreviewContext";
import { BlurTransition } from "./BlurTransition";
import { MaskTransition } from "./MaskTransition";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const WINDOW_FRACTION = 0.6;

const SECTION_COLOURS = [
    "var(--section-tint-1)",
    "var(--section-tint-2)",
    "var(--section-tint-3)",
    "var(--section-tint-4)",
];

interface Layout {
    boundaries: number[];
    firstTop: number;
    lastBottom: number;
    viewport: number;
}

const INITIAL_LAYOUT: Layout = {
    boundaries: [],
    firstTop: 0,
    lastBottom: 0,
    viewport: 900,
};

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
        boundaries: tops.slice(1).map((top, index) => (top + tops[index]) / 2),
        firstTop: tops[0],
        lastBottom: lastRect.top + window.scrollY + lastRect.height,
        viewport,
    };
}

interface SectionBackgroundManagerProps {
    children: ReactNode;
}

export function SectionBackgroundManager({
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

    const from =
        SECTION_COLOURS[Math.max(0, segment - 1) % SECTION_COLOURS.length];
    const to =
        SECTION_COLOURS[
            Math.min(SECTION_COLOURS.length - 1, segment) %
                SECTION_COLOURS.length
        ];
    const pair: [string, string] = [from, to];

    return (
        <>
            <motion.div
                aria-hidden="true"
                style={{ opacity: layerOpacity }}
                className="pointer-events-none fixed inset-0 z-[var(--z-backdrop)] overflow-hidden"
            >
                {backgroundTransition === "mask" ? (
                    <MaskTransition progress={progress} colours={pair} />
                ) : null}
                {backgroundTransition === "blur" ? (
                    <BlurTransition progress={progress} colours={pair} />
                ) : null}
            </motion.div>
            {children}
        </>
    );
}
