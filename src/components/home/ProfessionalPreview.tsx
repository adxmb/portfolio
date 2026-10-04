"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { portfolio, type CareerEntry } from "@/config/portfolioData";
import { formatMonth } from "@/lib/format";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "@/components/sections/Section";
import { ViewAllLink } from "./ViewAllLink";

/** Visible height of the scrollable timeline box, in pixels. Edit to taste. */
const TIMELINE_HEIGHT = 280;
/** Width, in pixels, of the rail column (line + dot) that is never faded. Matches each entry's pl-8. */
const RAIL_WIDTH = 32;
/** Maximum height, in pixels, of the fade at each edge. It ramps in and out over this distance. */
const FADE_SIZE = 64;
/** Multiplier applied to wheel input. 1 = native speed; higher is faster, lower is slower. */
const SCROLL_SPEED = 2;
/** Smoothing for the timeline wheel. Match the lerp in SmoothScrollProvider. */
const TIMELINE_LERP = 0.07;
/** A pause in wheel input longer than this (ms) ends a scroll gesture. */
// const GESTURE_GAP = 180;
/** Short pause (ms) before the page and the timeline hand scrolling to each other. */
const HANDOFF_BUFFER = 120;
/** Remaining distance (px) under which the timeline's glide counts as stopped. */
const SETTLE_PX = 6;

// Fade sizes come from CSS variables that are updated on scroll, so the fade
// shrinks continuously as you approach an edge instead of snapping off.
const TEXT_MASK =
    "linear-gradient(to bottom, transparent 0, black var(--fade-top, 0px), black calc(100% - var(--fade-bottom, 0px)), transparent 100%)";
const RAIL_MASK = "linear-gradient(black, black)";

const MASK_STYLE = {
    maskImage: `${TEXT_MASK}, ${RAIL_MASK}`,
    WebkitMaskImage: `${TEXT_MASK}, ${RAIL_MASK}`,
    maskSize: `calc(100% - ${RAIL_WIDTH}px) 100%, ${RAIL_WIDTH}px 100%`,
    WebkitMaskSize: `calc(100% - ${RAIL_WIDTH}px) 100%, ${RAIL_WIDTH}px 100%`,
    maskPosition: "right top, left top",
    WebkitMaskPosition: "right top, left top",
    maskRepeat: "no-repeat, no-repeat",
    WebkitMaskRepeat: "no-repeat, no-repeat",
};

function formatRange(
    entry: CareerEntry,
    locale: string,
    presentLabel: string,
): string {
    const start = formatMonth(entry.startDate, locale);
    if (!entry.endDate) return start;
    const end =
        entry.endDate === "present"
            ? presentLabel
            : formatMonth(entry.endDate, locale);
    return `${start} - ${end}`;
}

export function ProfessionalPreview() {
    const { professional, meta } = portfolio;
    const entries: CareerEntry[] = professional.groups
        .flatMap((group) => group.entries)
        .sort((a, b) => b.startDate.localeCompare(a.startDate));

    const scrollRef = useRef<HTMLOListElement>(null);
    const fadeRef = useRef<HTMLDivElement>(null);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        const box = fadeRef.current;
        if (!el || !box) return;
        const max = el.scrollHeight - el.clientHeight;
        // Fade grows over the first FADE_SIZE px of scroll and shrinks over the last.
        const top = Math.min(FADE_SIZE, Math.max(0, el.scrollTop));
        const bottom = Math.min(FADE_SIZE, Math.max(0, max - el.scrollTop));
        box.style.setProperty("--fade-top", `${top}px`);
        box.style.setProperty("--fade-bottom", `${bottom}px`);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        // `current` is the smoothed position, `target` is where the wheel wants to go.
        let current = el.scrollTop;
        let target = el.scrollTop;
        let raf = 0;
        let last = 0;
        // Timestamps that keep the page and the timeline from moving together.
        let pageMovedAt = -Infinity;
        let lastMoveAt = -Infinity;

        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            const diff = target - current;
            if (Math.abs(diff) >= SETTLE_PX) lastMoveAt = now;
            if (reduceMotion || Math.abs(diff) < 0.3) {
                current = target;
                el.scrollTop = current;
                updateScrollState();
                raf = 0;
                return;
            }
            // Frame-rate independent lerp, so it feels the same at 60 and 120 Hz.
            current += diff * (1 - Math.pow(1 - TIMELINE_LERP, dt * 60));
            el.scrollTop = current;
            updateScrollState();
            raf = requestAnimationFrame(tick);
        };

        const onScroll = () => {
            // Scrollbar drag, keyboard, touch: keep our position in sync.
            if (!raf) {
                current = el.scrollTop;
                target = el.scrollTop;
            }
            updateScrollState();
        };

        // Element scroll events don't bubble, so this only fires for the page.
        const onPageScroll = () => {
            pageMovedAt = performance.now();
        };

        const onWheel = (event: WheelEvent) => {
            // Let pinch-zoom (ctrl+wheel) and horizontal gestures alone.
            if (event.ctrlKey) return;
            if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

            let delta = event.deltaY;
            if (event.deltaMode === 1)
                delta *= 16; // lines -> px
            else if (event.deltaMode === 2) delta *= el.clientHeight; // pages -> px

            const now = performance.now();

            // The page is still moving, or only just stopped: leave the event to
            // Lenis. The timeline waits until the page has been still for a moment.
            if (now - pageMovedAt < HANDOFF_BUFFER) return;

            const max = el.scrollHeight - el.clientHeight;
            const goingDown = delta > 0;
            const atEnd =
                max <= 0 ||
                (goingDown && target >= max - 1) ||
                (!goingDown && target <= 0);

            if (atEnd) {
                // The timeline can't move this way. Once it has been still for a
                // moment, hand the event to the page; until then hold it, so the
                // two never move together.
                if (now - lastMoveAt > HANDOFF_BUFFER) return;
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            // The timeline owns this event; keep Lenis out of it.
            event.preventDefault();
            event.stopPropagation();

            lastMoveAt = now;
            target = Math.min(max, Math.max(0, target + delta * SCROLL_SPEED));
            if (!raf) {
                last = performance.now();
                raf = requestAnimationFrame(tick);
            }
        };

        updateScrollState();
        window.addEventListener("scroll", onPageScroll, { passive: true });
        el.addEventListener("wheel", onWheel, { passive: false });
        el.addEventListener("scroll", onScroll, { passive: true });
        const observer = new ResizeObserver(updateScrollState);
        observer.observe(el);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onPageScroll);
            el.removeEventListener("wheel", onWheel);
            el.removeEventListener("scroll", onScroll);
            observer.disconnect();
        };
    }, [updateScrollState]);

    return (
        <Section
            id="professional-preview"
            heading={professional.heading}
            intro={professional.intro}
            bgSection
        >
            <RevealGroup className="mt-16">
                <RevealItem as="div">
                    <div
                        ref={fadeRef}
                        style={{ height: TIMELINE_HEIGHT, ...MASK_STYLE }}
                        className="relative overflow-hidden"
                    >
                        <ol
                            ref={scrollRef}
                            className="h-full overflow-y-auto overscroll-contain pr-4 [scrollbar-gutter:stable]"
                        >
                            {entries.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="relative border-l border-hairline pb-12 pl-8 last:pb-0"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute -left-[5px] top-1.5 size-[9px] rounded-full bg-accent"
                                    />
                                    <Link
                                        href="/professional"
                                        className="group grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <p className="font-mono text-meta text-muted">
                                                {formatRange(
                                                    entry,
                                                    meta.locale,
                                                    professional.presentLabel,
                                                )}
                                            </p>
                                            <h3 className="text-balance font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.25rem)] font-bold transition-transform duration-500 ease-spring-out group-hover:translate-x-3 group-focus-visible:translate-x-3">
                                                {entry.title}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col gap-2 md:pt-1">
                                            <p className="font-medium text-ink">
                                                {entry.organisation}
                                            </p>
                                            <p className="max-w-[56ch] text-muted">
                                                {entry.summary}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </div>
                </RevealItem>
                <div className="mt-12">
                    <ViewAllLink
                        href="/professional"
                        label={professional.viewAllLabel}
                    />
                </div>
            </RevealGroup>
        </Section>
    );
}
