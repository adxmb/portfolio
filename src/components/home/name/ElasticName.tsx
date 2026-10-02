"use client";

import {
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";

import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useSpring,
} from "motion/react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

import { NameText } from "./NameText";
import { NameVariantProps } from "./registry";

/* ---------------------------------------------------------------------- *
 * Elastic / dough-stretch mechanics
 *
 * This intentionally keeps the original projective mesh behavior.
 *
 * The only protection added is against extreme spring overshoot:
 *
 *  - Normal dragging uses the original deformation exactly.
 *  - The return spring can still overshoot and bounce.
 *  - The displacement fed into the mesh is capped only at extreme values.
 *  - The original quad projective transform is preserved.
 *  - If an individual quad becomes mathematically degenerate, that quad
 *    falls back to an affine transform rather than disappearing.
 *
 * This keeps the smooth original look while preventing the browser's
 * perspective divide from reaching an unstable state.
 * ---------------------------------------------------------------------- */

const GRID_SIZE = 6;

const INFLUENCE = 0.46;

const NECK_STRENGTH = 0.4;

const MAX_PULL = 125;

const RESISTANCE = 0.68;

/*
 * This is deliberately generous.
 *
 * Your original MAX_PULL controls pointer resistance.
 * This value only prevents the underdamped RETURN_SPRING from producing
 * an arbitrarily large geometric excursion during its bounce.
 */
const MAX_DISPLACEMENT = MAX_PULL * 1.5;

const DRAG_SPRING = {
    stiffness: 520,
    damping: 34,
    mass: 0.28,
};

const RETURN_SPRING = {
    stiffness: 280,
    damping: 8,
    mass: 1,
};

const RELEASE_EPSILON = 0.08;

const TILE_BLEED = 0.23;

interface Point {
    x: number;
    y: number;
}

interface Geometry {
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
    grabX: number;
    grabY: number;
    reach: number;
}

/**
 * Original projective quad transform.
 *
 * This is intentionally left essentially unchanged from the original
 * implementation so the normal stretching behavior remains the same.
 */
function quadMatrix3d(
    width: number,
    height: number,
    corners: readonly [Point, Point, Point, Point],
): string {
    const [p0, p1, p2, p3] = corners;

    const dx1 = p1.x - p2.x;
    const dx2 = p3.x - p2.x;

    const sx = p0.x - p1.x + p2.x - p3.x;

    const dy1 = p1.y - p2.y;
    const dy2 = p3.y - p2.y;

    const sy = p0.y - p1.y + p2.y - p3.y;

    let g = 0;
    let h = 0;

    const denom = dx1 * dy2 - dx2 * dy1;

    if (
        (Math.abs(sx) > 1e-6 || Math.abs(sy) > 1e-6) &&
        Math.abs(denom) > 1e-9
    ) {
        g = (sx * dy2 - dx2 * sy) / denom;

        h = (dx1 * sy - sx * dy1) / denom;
    }

    const a = p1.x - p0.x + g * p1.x;

    const b = p3.x - p0.x + h * p3.x;

    const c = p0.x;

    const d = p1.y - p0.y + g * p1.y;

    const e = p3.y - p0.y + h * p3.y;

    const f = p0.y;

    const w = Math.max(1, width);
    const hgt = Math.max(1, height);

    const A = a / w;
    const B = b / hgt;

    const D = d / w;
    const E = e / hgt;

    const G = g / w;
    const H = h / hgt;

    return `matrix3d(
        ${A},${D},0,${G},
        ${B},${E},0,${H},
        0,0,1,0,
        ${c},${f},0,1
    )`;
}

/**
 * Affine fallback for a degenerate quad.
 *
 * This is NOT used during normal stretching.
 * It exists only so a pathological individual tile never gets an
 * invalid projective transform.
 */
function affineMatrix(
    width: number,
    height: number,
    corners: readonly [Point, Point, Point, Point],
): string {
    const [p0, p1, p3] = corners;

    const w = Math.max(1, width);
    const h = Math.max(1, height);

    const a = (p1.x - p0.x) / w;

    const b = (p1.y - p0.y) / w;

    const c = (p3.x - p0.x) / h;

    const d = (p3.y - p0.y) / h;

    return `matrix3d(
        ${a},${b},0,0,
        ${c},${d},0,0,
        0,0,1,0,
        ${p0.x},${p0.y},0,1
    )`;
}

/**
 * Determines whether a quad is so extreme that the projective transform
 * is approaching a perspective singularity.
 *
 * This is intentionally conservative about when it activates:
 * ordinary deformation is untouched.
 */
function isUnsafeQuad(
    corners: readonly [Point, Point, Point, Point],
    width: number,
    height: number,
): boolean {
    const [p0, p1, p2, p3] = corners;

    const dx1 = p1.x - p2.x;
    const dx2 = p3.x - p2.x;

    const sx = p0.x - p1.x + p2.x - p3.x;

    const dy1 = p1.y - p2.y;
    const dy2 = p3.y - p2.y;

    const sy = p0.y - p1.y + p2.y - p3.y;

    const denom = dx1 * dy2 - dx2 * dy1;

    /*
     * If the homography denominator itself is almost singular,
     * don't let it reach matrix3d.
     */
    if (Math.abs(denom) < 1e-7) {
        return true;
    }

    let g = (sx * dy2 - dx2 * sy) / denom;

    let h = (dx1 * sy - sx * dy1) / denom;

    if (!Number.isFinite(g) || !Number.isFinite(h)) {
        return true;
    }

    /*
     * For normalized x/y coordinates [0,1], the perspective denominator
     * is approximately:
     *
     *     1 + g*x + h*y
     *
     * The smallest value is at the corner selected by the signs of g/h.
     */
    const minimumW = 1 + Math.min(0, g) + Math.min(0, h);

    /*
     * Only intervene when we're genuinely close to the dangerous region.
     *
     * 0.12 leaves a lot of room for the normal projective effect.
     */
    if (minimumW < 0.12) {
        return true;
    }

    /*
     * Avoid absurd numerical values caused by an almost-flat quad.
     */
    const MAX_GH = 50;

    if (Math.abs(g) > MAX_GH || Math.abs(h) > MAX_GH) {
        return true;
    }

    /*
     * Also reject NaN/Infinity after all calculations.
     */
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
        return true;
    }

    return false;
}

export function ElasticName({ lines, name }: NameVariantProps) {
    const reduceMotion = useSafeReducedMotion();

    return (
        <motion.h1
            id="site-name"
            aria-label={name}
            className="font-display text-name font-extrabold"
        >
            <NameText
                lines={lines}
                renderChar={(char, index) => (
                    <ElasticChar
                        char={char}
                        index={index}
                        still={Boolean(reduceMotion)}
                    />
                )}
            />
        </motion.h1>
    );
}

interface ElasticCharProps {
    char: string;
    index: number;
    still: boolean;
}

function ElasticChar({ char, still }: ElasticCharProps) {
    const ref = useRef<HTMLSpanElement>(null);

    const tileRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const [dragging, setDragging] = useState(false);

    const [meshActive, setMeshActive] = useState(false);

    const geometry = useRef<Geometry>({
        width: 0,
        height: 0,
        cellWidth: 0,
        cellHeight: 0,
        grabX: 0,
        grabY: 0,
        reach: 1,
    });

    const pullX = useMotionValue(0);

    const pullY = useMotionValue(0);

    const dragX = useSpring(pullX, DRAG_SPRING);

    const dragY = useSpring(pullY, DRAG_SPRING);

    const returnX = useSpring(dragX, RETURN_SPRING);

    const returnY = useSpring(dragY, RETURN_SPRING);

    useAnimationFrame(() => {
        if (!meshActive) {
            return;
        }

        /*
         * Read the original spring values.
         */
        const rawPx = returnX.get();

        const rawPy = returnY.get();

        const rawLength = Math.hypot(rawPx, rawPy);

        /*
         * Stop once the spring has returned to rest.
         */
        if (!dragging && rawLength < RELEASE_EPSILON) {
            setMeshActive(false);

            /*
             * Clear transforms so the native character immediately
             * becomes the source of truth again.
             */
            for (const tile of tileRefs.current) {
                if (tile) {
                    tile.style.transform = "";
                }
            }

            return;
        }

        /*
         * IMPORTANT:
         *
         * This is the only change to the original deformation field.
         *
         * We preserve the spring's direction and normal values, but stop
         * its extreme underdamped overshoot from producing an arbitrarily
         * large quad.
         */
        const clampedLength = Math.min(rawLength, MAX_DISPLACEMENT);

        const scale = rawLength > 1e-4 ? clampedLength / rawLength : 0;

        const px = rawPx * scale;

        const py = rawPy * scale;

        const pullLength = clampedLength;

        const { cellWidth, cellHeight, grabX, grabY, reach } = geometry.current;

        const axisX = pullLength > 1e-4 ? px / pullLength : 0;

        const axisY = pullLength > 1e-4 ? py / pullLength : 0;

        const perpX = -axisY;
        const perpY = axisX;

        const normalizedPull = Math.min(1, pullLength / MAX_PULL);

        /*
         * Build the exact same displacement field as the original.
         */
        const verts: Point[][] = [];

        for (let row = 0; row <= GRID_SIZE; row += 1) {
            const line: Point[] = [];

            for (let col = 0; col <= GRID_SIZE; col += 1) {
                const restX = col * cellWidth;

                const restY = row * cellHeight;

                const dxg = restX - grabX;

                const dyg = restY - grabY;

                const distance = Math.hypot(dxg, dyg);

                const influence = Math.exp(-Math.pow(distance / reach, 2));

                /*
                 * Original elongation.
                 */
                const alongX = px * influence;

                const alongY = py * influence;

                /*
                 * Original necking.
                 *
                 * This is intentionally NOT reduced.
                 * That was contributing to the changed appearance
                 * in the previous version.
                 */
                const perpOffset = dxg * perpX + dyg * perpY;

                const neckAmount =
                    perpOffset * NECK_STRENGTH * influence * normalizedPull;

                line.push({
                    x: restX + alongX - perpX * neckAmount,

                    y: restY + alongY - perpY * neckAmount,
                });
            }

            verts.push(line);
        }

        /*
         * Apply transforms.
         */
        for (let row = 0; row < GRID_SIZE; row += 1) {
            for (let col = 0; col < GRID_SIZE; col += 1) {
                const tile = tileRefs.current[row * GRID_SIZE + col];

                if (!tile) {
                    continue;
                }

                const restLeft = col * cellWidth;

                const restTop = row * cellHeight;

                const relative = (point: Point): Point => ({
                    x: point.x - restLeft,

                    y: point.y - restTop,
                });

                const corners: [Point, Point, Point, Point] = [
                    relative(verts[row][col]),

                    relative(verts[row][col + 1]),

                    relative(verts[row + 1][col + 1]),

                    relative(verts[row + 1][col]),
                ];

                /*
                 * Normal case:
                 *
                 * Use the ORIGINAL projective warp.
                 *
                 * This is what preserves your original smooth
                 * stretching appearance.
                 */
                if (!isUnsafeQuad(corners, cellWidth, cellHeight)) {
                    tile.style.transform = quadMatrix3d(
                        cellWidth,
                        cellHeight,
                        corners,
                    );
                } else {
                    /*
                     * Only an extreme pathological tile gets the
                     * affine fallback.
                     *
                     * This prevents a single tile from disappearing
                     * while leaving the rest of the character's
                     * projective stretching untouched.
                     */
                    tile.style.transform = affineMatrix(
                        cellWidth,
                        cellHeight,
                        corners,
                    );
                }
            }
        }
    });

    const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
        if (still) {
            return;
        }

        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        const element = ref.current;

        if (!element) {
            return;
        }

        const rect = element.getBoundingClientRect();

        const width = Math.max(1, rect.width);

        const height = Math.max(1, rect.height);

        const grabX = Math.max(0, Math.min(width, event.clientX - rect.left));

        const grabY = Math.max(0, Math.min(height, event.clientY - rect.top));

        geometry.current = {
            width,
            height,

            cellWidth: width / GRID_SIZE,

            cellHeight: height / GRID_SIZE,

            grabX,
            grabY,

            reach: Math.max(1, INFLUENCE * Math.hypot(width, height)),
        };

        pullX.set(0);
        pullY.set(0);

        setDragging(true);
        setMeshActive(true);

        event.currentTarget.setPointerCapture(event.pointerId);

        event.preventDefault();
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
        if (!dragging || still) {
            return;
        }

        const element = ref.current;

        if (!element) {
            return;
        }

        const rect = element.getBoundingClientRect();

        const { grabX, grabY } = geometry.current;

        const grabScreenX = rect.left + grabX;

        const grabScreenY = rect.top + grabY;

        const dx = event.clientX - grabScreenX;

        const dy = event.clientY - grabScreenY;

        const distance = Math.hypot(dx, dy);

        if (distance === 0) {
            pullX.set(0);
            pullY.set(0);

            return;
        }

        const normalized = Math.min(1, distance / MAX_PULL);

        const resistance = 1 - Math.pow(normalized, 1.45) * RESISTANCE;

        const amount = Math.max(0.18, resistance);

        /*
         * Original pointer behavior.
         */
        pullX.set(dx * amount);

        pullY.set(dy * amount);

        event.preventDefault();
    };

    const release = (event?: ReactPointerEvent<HTMLSpanElement>) => {
        if (!dragging) {
            return;
        }

        setDragging(false);

        if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        /*
         * Return spring produces the original elastic bounce.
         */
        pullX.set(0);
        pullY.set(0);
    };

    const { width, height, cellWidth, cellHeight } = geometry.current;

    return (
        <span
            ref={ref}
            className="relative inline-block select-none"
            style={{
                touchAction: "none",
                overflow: "visible",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={() => {
                if (!dragging) {
                    return;
                }

                setDragging(false);

                pullX.set(0);
                pullY.set(0);
            }}
        >
            <span
                style={{
                    opacity: meshActive ? 0 : 1,
                }}
            >
                {char}
            </span>

            {meshActive && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        overflow: "visible",
                    }}
                >
                    {Array.from(
                        {
                            length: GRID_SIZE * GRID_SIZE,
                        },
                        (_, cellIndex) => {
                            const row = Math.floor(cellIndex / GRID_SIZE);

                            const col = cellIndex % GRID_SIZE;

                            const left = col * cellWidth - TILE_BLEED;

                            const top = row * cellHeight - TILE_BLEED;

                            return (
                                <span
                                    key={cellIndex}
                                    ref={(el) => {
                                        tileRefs.current[cellIndex] = el;
                                    }}
                                    style={{
                                        position: "absolute",

                                        left,
                                        top,

                                        width: cellWidth + TILE_BLEED * 2,

                                        height: cellHeight + TILE_BLEED * 2,

                                        overflow: "hidden",

                                        transformOrigin: "0 0",

                                        /*
                                         * Allows the browser to optimize
                                         * the same transforms you had
                                         * originally.
                                         */
                                        willChange: "transform",
                                    }}
                                >
                                    <span
                                        style={{
                                            position: "absolute",

                                            left: -left,

                                            top: -top,

                                            width,
                                            height,

                                            display: "inline-block",
                                        }}
                                    >
                                        {char}
                                    </span>
                                </span>
                            );
                        },
                    )}
                </span>
            )}
        </span>
    );
}
