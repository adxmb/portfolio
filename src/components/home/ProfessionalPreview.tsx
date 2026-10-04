"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { portfolio, type CareerEntry } from "@/config/portfolioData";
import { formatMonth } from "@/lib/format";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "@/components/sections/Section";
import { ViewAllLink } from "./ViewAllLink";

/** Visible height of the scrollable timeline box, in pixels. Edit to taste. */
const TIMELINE_HEIGHT = 260;
/** Width, in pixels, of the rail column (line + dot) that is never faded. Matches each entry's pl-8. */
const RAIL_WIDTH = 32;
/** Height, in pixels, of the fade at each edge where more content exists. */
const FADE_SIZE = 64;
/** Multiplier applied to wheel input. 1 = native speed; higher is faster, lower is slower. */
const SCROLL_SPEED = 0.3;

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

/** Nearest ancestor that actually scrolls vertically, or null if it's the window. */
function getScrollParent(el: HTMLElement): HTMLElement | null {
    let node = el.parentElement;
    while (
        node &&
        node !== document.body &&
        node !== document.documentElement
    ) {
        const { overflowY } = getComputedStyle(node);
        if (
            /(auto|scroll|overlay)/.test(overflowY) &&
            node.scrollHeight > node.clientHeight
        ) {
            return node;
        }
        node = node.parentElement;
    }
    return null;
}

export function ProfessionalPreview() {
    const { professional, meta } = portfolio;
    const entries: CareerEntry[] = professional.groups
        .flatMap((group) => group.entries)
        .sort((a, b) => b.startDate.localeCompare(a.startDate));

    const scrollRef = useRef<HTMLOListElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollUp(el.scrollTop > 1);
        setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        updateScrollState();

        const onWheel = (event: WheelEvent) => {
            // Let pinch-zoom (ctrl+wheel) and horizontal gestures alone.
            if (event.ctrlKey) return;
            if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

            let delta = event.deltaY;
            if (event.deltaMode === 1)
                delta *= 16; // lines -> px
            else if (event.deltaMode === 2) delta *= el.clientHeight; // pages -> px

            const goingDown = delta > 0;
            const atTop = el.scrollTop <= 0;
            const atBottom =
                el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            const atEdge =
                el.scrollHeight <= el.clientHeight ||
                (goingDown && atBottom) ||
                (!goingDown && atTop);

            // Always take over the event, so nothing else also scrolls
            // (that double-scroll was the original bug).
            event.preventDefault();
            event.stopPropagation();

            if (!atEdge) {
                // Timeline still has room: scroll only the timeline.
                el.scrollTop += delta * SCROLL_SPEED;
                return;
            }

            // At the edge: hand the scroll to the page ourselves.
            const parent = getScrollParent(el);
            if (parent) parent.scrollTop += delta;
            else window.scrollBy({ top: delta, left: 0, behavior: "instant" });
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        el.addEventListener("scroll", updateScrollState, { passive: true });
        const observer = new ResizeObserver(updateScrollState);
        observer.observe(el);
        return () => {
            el.removeEventListener("wheel", onWheel);
            el.removeEventListener("scroll", updateScrollState);
            observer.disconnect();
        };
    }, [updateScrollState]);

    // Only the text column (right of RAIL_WIDTH) fades; the rail stays fully
    // opaque always. Each edge fades only when there is more content that way.
    const topStop = canScrollUp
        ? `transparent 0, black ${FADE_SIZE}px`
        : "black 0";
    const bottomStop = canScrollDown
        ? `black calc(100% - ${FADE_SIZE}px), transparent 100%`
        : "black 100%";
    const textMask = `linear-gradient(to bottom, ${topStop}, ${bottomStop})`;
    const railMask = "linear-gradient(black, black)";

    const maskStyle = {
        maskImage: `${textMask}, ${railMask}`,
        WebkitMaskImage: `${textMask}, ${railMask}`,
        maskSize: `calc(100% - ${RAIL_WIDTH}px) 100%, ${RAIL_WIDTH}px 100%`,
        WebkitMaskSize: `calc(100% - ${RAIL_WIDTH}px) 100%, ${RAIL_WIDTH}px 100%`,
        maskPosition: "right top, left top",
        WebkitMaskPosition: "right top, left top",
        maskRepeat: "no-repeat, no-repeat",
        WebkitMaskRepeat: "no-repeat, no-repeat",
    };

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
                        style={{ height: TIMELINE_HEIGHT, ...maskStyle }}
                        className="relative overflow-hidden"
                    >
                        <ol
                            ref={scrollRef}
                            data-lenis-prevent
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
