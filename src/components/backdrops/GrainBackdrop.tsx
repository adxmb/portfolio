"use client";

import type { ImageAsset } from "@/config/portfolioData";
import { FillImage } from "../ui/FillImage";

interface GrainBackdropProps {
    image: ImageAsset;
    className?: string;
}

/**
 * Alternative Option 3: a still photograph with a looping film-grain texture
 * over it. Everything here is a static image and a CSS animation stepping
 * through a tiled noise texture, so there is no JavaScript animation loop and
 * no per-frame cost beyond compositing.
 *
 * The grain itself is the same inline SVG turbulence data URI used by the RGB
 * split background transition, kept small and tiled, with its position
 * stepped every frame of a very short (8-step) animation so it reads as
 * flickering analogue grain rather than a static texture or a smooth drift.
 */
export function GrainBackdrop({ image, className = "" }: GrainBackdropProps) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-[var(--z-backdrop)] overflow-hidden ${className}`}
        >
            <div className="absolute inset-0 opacity-45 grayscale">
                <FillImage image={image} sizes="100vw" showLabel={false} />
            </div>
            <div className="absolute inset-0 bg-canvas opacity-70" />
            <div className="grain-loop absolute -inset-full opacity-[0.18] mix-blend-overlay" />
        </div>
    );
}
