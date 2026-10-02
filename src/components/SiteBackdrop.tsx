"use client";

import { usePathname } from "next/navigation";
import { portfolio } from "@/config/portfolioData";
import { BentoBackdrop } from "./backdrops/BentoBackdrop";
import { GrainBackdrop } from "./backdrops/GrainBackdrop";

/**
 * Chooses the inner-page background from portfolio.backdrop.type:
 * - "bento": a quiet structural grid with a cursor-tracked glow. Cheapest option.
 * - "grain": a still photo with a looping film-grain texture.
 * - "off": nothing.
 *
 * Never shown on the landing page ("/"), which has its own per-section
 * background system. Because this component sits in the root layout, whichever
 * backdrop is chosen is created once and survives navigation between the inner
 * pages instead of being rebuilt on every route change.
 */
export function SiteBackdrop() {
    const pathname = usePathname();
    const { backdrop } = portfolio;

    if (pathname === "/" || backdrop.type === "off") return null;
    if (backdrop.type === "bento") return <BentoBackdrop />;
    return <GrainBackdrop image={backdrop.grainImage} />;
}
