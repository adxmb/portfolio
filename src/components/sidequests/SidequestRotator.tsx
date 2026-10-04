"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
} from "react";
import {
    AnimatePresence,
    animate,
    motion,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
    useTransform,
    type MotionValue,
} from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { ImageAsset, Link } from "@/config/portfolioData";
import { EASE_OUT, ORBIT_SPRING } from "@/lib/motion";
import { FillImage } from "@/components/ui/FillImage";
import { RichText } from "../ui/RichText";

export interface RotatorItem {
    id: string;
    title: string;
    /** Pre-formatted line such as "Hobby, Mar 2025". */
    meta: string;
    summary: string;
    image: ImageAsset;
    link?: Link;
}

interface SidequestRotatorProps {
    items: RotatorItem[];
    /** Accessible name of the carousel. */
    label: string;
    /** Short instruction shown under the stage. */
    hint: string;
}

/** Everything the satellites need to place themselves, in pixels, derived from the stage size. */
interface Geometry {
    /** Centre of the central frame. */
    cx: number;
    cy: number;
    /** Centre of the ring the satellites travel on. It sits below the frame's centre, so the front of the ring crosses the frame's lower edge. */
    ringCy: number;
    /** Half-width and half-height of the ring. The ring is deliberately flat: ry is a small fraction of rx. */
    rx: number;
    ry: number;
    satSize: number;
    centreWidth: number;
    centreHeight: number;
}

/** Degrees of rotation per pixel of horizontal drag, and per unit of horizontal wheel delta. */
const DRAG_DEGREES_PER_PIXEL = 0.32;
const WHEEL_DEGREES_PER_UNIT = 0.2;
/** How far a drag must travel before it counts as a drag and not a click. */
const DRAG_THRESHOLD = 6;
/** How far ahead, in seconds of release velocity, the ring is allowed to coast before it snaps. */
const COAST_SECONDS = 0.18;

const round = (value: number, decimals = 6) => Number(value.toFixed(decimals));

const modulo = (value: number, size: number) => ((value % size) + size) % size;

const STAGE_PAD = 24;

function computeGeometry(width: number): Geometry & { height: number } {
    const compact = width < 640;
    const centreHeight = compact ? width * 0.7 : width * 0.34;
    const height = centreHeight + STAGE_PAD * 2;
    const cy = height / 2;
    return {
        height: round(height),
        cx: width / 2,
        cy,
        ringCy: cy,
        rx: round(width * (compact ? 0.4 : 0.28)),
        ry: round(centreHeight * (compact ? 0.22 : 0.22)),
        satSize: compact
            ? round(Math.max(38, width * 0.11))
            : round(Math.max(78, Math.min(width * 0.048, 108))),
        centreWidth: round(centreHeight * 0.8),
        centreHeight: round(centreHeight),
    };
}

function Caption({ item }: { item: RotatorItem }) {
    return (
        <div className="grid gap-6 border-t border-hairline pt-8 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.4fr)] md:gap-16">
            <div className="flex flex-col gap-2 md:items-end md:text-right">
                <p className="font-mono text-meta text-muted">{item.meta}</p>
                <h3 className="text-balance font-display text-h2 font-bold">
                    {item.title}
                </h3>
            </div>
            <div className="flex max-w-[62ch] flex-col gap-4 md:pt-1">
                <dd style={{ whiteSpace: "pre-line" }}>
                    <RichText text={item.summary} />
                </dd>
                {item.link ? (
                    <a
                        href={item.link.href}
                        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium underline decoration-hairline decoration-2 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
                    >
                        {item.link.label}
                        <ArrowUpRightIcon
                            size={14}
                            weight="bold"
                            aria-hidden="true"
                        />
                    </a>
                ) : null}
            </div>
        </div>
    );
}

/**
 * The Bureau Nines style rotator: a ring of small satellite images, twelve in
 * the default config, coasts along a tight, flat horizon level with the centre
 * of one large central image. The satellites carry no motion of their own: no
 * hover scale, no idle float, no bobbing. Every pixel of their position comes
 * from the single shared rotation value, so they read as fixed points on one
 * orbit timeline rather than independently animated elements.
 *
 * The ring has a single number, its rotation in degrees. Item i sits at
 * 90 + i * step + rotation degrees around the ring, and 90 degrees is the front
 * (bottom centre, nearest the viewer). The ring is wide and flat, so a step of
 * 30 degrees moves an item mostly sideways. Every satellite derives its
 * position, size, opacity and stacking order from that one angle: items at the
 * front are large, bright and in front of the central image, items at the back
 * are small, faded and behind it. That is what makes a flat ellipse read as an
 * orbit in depth.
 *
 * Input only ever changes a target angle. A heavy spring (ORBIT_SPRING) turns
 * the target into the angle actually drawn, so dragging feels weighted and the
 * ring glides to rest without bouncing:
 * - Drag: the ring follows the pointer, and on release coasts a little further
 *   then snaps so the nearest item is at the front.
 * - Sideways wheel or trackpad swipe: rotates the ring. Vertical scrolling is
 *   left alone so the page never gets trapped.
 * - Click a thumbnail: rotates that item to the front by the shortest way round.
 * - Keyboard: left and right arrows step through the items.
 *
 * The item at the front is the active item. Whenever it changes, the central
 * image cross-fades to match it, passing through a blur, and the caption
 * beneath changes with it. All motion runs on motion values, so dragging never
 * re-renders React; only a change of active item does.
 */
export function SidequestRotator({
    items,
    label,
    hint,
}: SidequestRotatorProps) {
    const reduceMotion = useSafeReducedMotion();
    const realCount = items.length;
    const count = realCount * 2;
    const step = count > 0 ? 360 / count : 360;

    const stageRef = useRef<HTMLDivElement>(null);
    // const [size, setSize] = useState<{ width: number; height: number } | null>(
    //     null,
    // );
    // const geometry = useMemo(
    //     () => (size ? computeGeometry(size.width, size.height) : null),
    //     [size],
    // );
    // const geometryValue = useMotionValue<Geometry>(computeGeometry(1200, 700));

    const [width, setWidth] = useState<number | null>(null);
    const geometry = useMemo(
        () => (width ? computeGeometry(width) : null),
        [width],
    );
    const geometryValue = useMotionValue<Geometry>(computeGeometry(1200));

    const rotationTarget = useMotionValue(0);
    const spring = useSpring(rotationTarget, ORBIT_SPRING);
    // const rotation = useTransform(() =>
    //     reduceMotion ? rotationTarget.get() : spring.get(),
    // );
    const rotation = useTransform(
        reduceMotion ? rotationTarget : spring,
        (value) => value,
    );

    const [activeIndex, setActiveIndex] = useState(0);
    const drag = useRef({
        pressed: false,
        dragging: false,
        startX: 0,
        startTarget: 0,
        lastX: 0,
        lastTime: 0,
        velocity: 0,
    });

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        // const observer = new ResizeObserver(([entry]) => {
        //     setSize({
        //         width: entry.contentRect.width,
        //         height: entry.contentRect.height,
        //     });
        // });
        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });

        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    useMotionValueEvent(rotationTarget, "change", (value) => {
        const next = modulo(Math.round(-value / step), count);
        setActiveIndex((previous) => (previous === next ? previous : next));
    });

    /** Rotates the ring so that item index is at the front, taking the shortest way round. */
    const rotateTo = (index: number) => {
        const current = rotationTarget.get();
        const desired = -index * step;
        const delta = ((((desired - current) % 360) + 540) % 360) - 180;
        rotationTarget.set(current + delta);
    };

    /** Settles the ring on the nearest item, optionally after coasting on release velocity. */
    const settle = (coast = 0) => {
        const projected = rotationTarget.get() + coast;
        rotateTo(modulo(Math.round(-projected / step), count));
    };

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage || count < 2) return;
        let timer: number | undefined;

        const onWheel = (event: WheelEvent) => {
            if (
                Math.abs(event.deltaX) <= Math.abs(event.deltaY) ||
                Math.abs(event.deltaX) < 3
            )
                return;
            event.preventDefault();
            event.stopPropagation();
            rotationTarget.set(
                rotationTarget.get() + event.deltaX * WHEEL_DEGREES_PER_UNIT,
            );
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                const next = modulo(
                    Math.round(-rotationTarget.get() / step),
                    count,
                );
                const current = rotationTarget.get();
                const delta =
                    ((((-next * step - current) % 360) + 540) % 360) - 180;
                rotationTarget.set(current + delta);
            }, 140);
        };

        stage.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            window.clearTimeout(timer);
            stage.removeEventListener("wheel", onWheel);
        };
    }, [count, step, rotationTarget]);

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (count < 2 || event.button !== 0) return;
        drag.current = {
            pressed: true,
            dragging: false,
            startX: event.clientX,
            startTarget: rotationTarget.get(),
            lastX: event.clientX,
            lastTime: performance.now(),
            velocity: 0,
        };
    };

    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const state = drag.current;
        if (!state.pressed) return;
        const travelled = event.clientX - state.startX;

        if (!state.dragging && Math.abs(travelled) > DRAG_THRESHOLD) {
            state.dragging = true;
            event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (!state.dragging) return;

        const now = performance.now();
        const elapsed = Math.max(1, now - state.lastTime) / 1000;
        state.velocity =
            (-(event.clientX - state.lastX) * DRAG_DEGREES_PER_PIXEL) / elapsed;
        state.lastX = event.clientX;
        state.lastTime = now;

        // Dragging right pulls the front item to the right, which is a decreasing angle.
        rotationTarget.set(
            state.startTarget - travelled * DRAG_DEGREES_PER_PIXEL,
        );
    };

    const endDrag = () => {
        const state = drag.current;
        if (state.dragging) settle(state.velocity * COAST_SECONDS);
        // Keep "dragging" true until after the click event that follows a drag has been ignored.
        window.setTimeout(() => {
            drag.current.pressed = false;
            drag.current.dragging = false;
        }, 0);
        state.pressed = false;
    };

    /** One handler for every thumbnail, found through data-orbit-index. Ignored if the gesture was a drag. */
    const onClick = (event: MouseEvent<HTMLDivElement>) => {
        if (drag.current.dragging) return;
        const target = (event.target as HTMLElement).closest<HTMLElement>(
            "[data-orbit-index]",
        );
        if (target) rotateTo(Number(target.dataset.orbitIndex));
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (count < 2) return;
        if (event.key === "ArrowRight") {
            event.preventDefault();
            rotateTo(modulo(activeIndex + 1, count));
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            rotateTo(modulo(activeIndex - 1, count));
        }
    };

    if (count === 0) return null;
    if (!geometry) {
        return (
            <div ref={stageRef} className="w-full" style={{ minHeight: 320 }} />
        );
    }
    geometryValue.set(geometry);
    const active = items[modulo(activeIndex, realCount)];
    const stageHeight = geometry.height;

    return (
        <div className="flex flex-col gap-8">
            <div
                ref={stageRef}
                role="group"
                aria-roledescription="carousel"
                aria-label={label}
                tabIndex={0}
                style={{
                    height: stageHeight,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={onClick}
                onKeyDown={onKeyDown}
                className="relative w-full cursor-grab touch-pan-y select-none overflow-hidden outline-offset-8 active:cursor-grabbing"
            >
                {geometry ? (
                    <>
                        {/* Central image. Each new one fades in from a blur while the old one fades out into one. */}
                        <div
                            className="absolute z-[500] overflow-hidden shadow-[0_0_0_1px_var(--hairline),0_14px_32px_-22px_color-mix(in_srgb,var(--ink)_22%,transparent)]"
                            style={{
                                left: geometry.cx - geometry.centreWidth / 2,
                                top: geometry.cy - geometry.centreHeight / 2,
                                width: geometry.centreWidth,
                                height: geometry.centreHeight,
                            }}
                        >
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={active.id}
                                    className="absolute inset-0"
                                    initial={
                                        reduceMotion
                                            ? { opacity: 0 }
                                            : {
                                                  opacity: 0,
                                                  scale: 1.01,
                                                  filter: "blur(6px)",
                                              }
                                    }
                                    animate={
                                        reduceMotion
                                            ? { opacity: 1 }
                                            : {
                                                  opacity: 1,
                                                  scale: 1,
                                                  filter: "blur(0px)",
                                              }
                                    }
                                    exit={
                                        reduceMotion
                                            ? { opacity: 0 }
                                            : {
                                                  opacity: 0,
                                                  scale: 0.999,
                                                  filter: "blur(66px)",
                                              }
                                    }
                                    transition={{
                                        duration: 0.6,
                                        ease: EASE_OUT,
                                    }}
                                >
                                    <FillImage
                                        image={active.image}
                                        priority
                                        sizes="(min-width: 768px) 36vw, 70vw"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {count > 1
                            ? [...items, ...items].map((item, index) => (
                                  <Satellite
                                      key={`${item.id}-${index}`}
                                      item={item}
                                      index={index}
                                      count={count}
                                      rotation={rotation}
                                      geometry={geometryValue}
                                      size={geometry.satSize}
                                      active={index === activeIndex}
                                  />
                              ))
                            : null}
                    </>
                ) : null}
            </div>

            <div aria-live="polite" className="grid">
                {/* Sizer: every caption stacked invisibly, so the cell is always as tall as the tallest one. */}
                {items.map((item) => (
                    <div
                        key={item.id}
                        aria-hidden="true"
                        className="invisible col-start-1 row-start-1"
                    >
                        <Caption item={item} />
                    </div>
                ))}

                <div className="col-start-1 row-start-1">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={active.id}
                            initial={
                                reduceMotion ? false : { opacity: 0, y: 14 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={
                                reduceMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, y: -14 }
                            }
                            transition={{ duration: 0.35, ease: EASE_OUT }}
                        >
                            <Caption item={active} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

interface SatelliteProps {
    item: RotatorItem;
    index: number;
    count: number;
    rotation: MotionValue<number>;
    geometry: MotionValue<Geometry>;
    /** Thumbnail edge length in pixels. */
    size: number;
    active: boolean;
}

/**
 * One thumbnail on the ellipse. Its angle comes from the shared rotation, and
 * everything else follows from the angle: sin of it says how near the front it
 * is (1 at the very front, -1 at the very back), which sets scale, opacity and
 * whether it is stacked in front of or behind the central image.
 */
function Satellite({
    item,
    index,
    count,
    rotation,
    geometry,
    size,
    active,
}: SatelliteProps) {
    const angle = useTransform(
        () => ((90 + index * (360 / count) + rotation.get()) * Math.PI) / 180,
    );
    const nearness = useTransform(() => Math.sin(angle.get()));

    const x = useTransform(() => {
        const g = geometry.get();
        return round(g.cx + g.rx * Math.cos(angle.get()) - size / 2);
    });
    // ringCy is the one fixed vertical coordinate every satellite shares (the central image's own centre),
    // so y only ever departs from that single horizon line by ry, never by an independent offset.
    const y = useTransform(() => {
        const g = geometry.get();
        return round(g.ringCy + g.ry * Math.sin(angle.get()) - size / 2);
    });

    const rawScale = useTransform(nearness, [-1, 1], [0.6, 1.2]);
    const scale = useTransform(rawScale, (value) => round(value));

    const rawOpacity = useTransform(nearness, [-1, 0, 1], [0.35, 0.8, 1]);
    const opacity = useTransform(rawOpacity, (value) => round(value));

    // const zIndex = useTransform(nearness, (n) => (n > 0.1 ? 20 : 5));
    const zIndex = useTransform(nearness, (n) =>
        n > 0.1 ? 1000 + Math.round(n * 1000) : Math.round((n + 1) * 400),
    );

    return (
        // No hover scale, no idle float, no bobbing: position, size and opacity come only from the
        // shared rotation value, so a satellite never moves except along its orbit timeline.
        <motion.div
            style={{ x, y, scale, opacity, zIndex, width: size, height: size }}
            className="absolute left-0 top-0"
        >
            <button
                type="button"
                data-orbit-index={index}
                aria-label={item.title}
                aria-current={active ? "true" : undefined}
                className={`relative block h-full w-full overflow-hidden transition-shadow duration-500 ${
                    active
                        ? "shadow-[0_0_0_2px_var(--accent)]"
                        : "shadow-[0_0_0_1px_var(--hairline)]"
                }`}
            >
                {item.image.src ? (
                    <FillImage
                        image={item.image}
                        sizes="180px"
                        showLabel={false}
                    />
                ) : (
                    // No photo yet: a numbered block, tinted a little differently by position, so the ring is readable and nothing points at a missing file.
                    <span
                        className="absolute inset-0 grid place-items-center font-mono text-meta text-ink"
                        style={{
                            background: `color-mix(in srgb, var(--ink) ${5 + (index % 4) * 4}%, var(--surface))`,
                        }}
                    >
                        {String(index + 1).padStart(2, "0")}
                    </span>
                )}
            </button>
        </motion.div>
    );
}
