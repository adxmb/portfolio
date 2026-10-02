import type { ComponentType, RefObject } from "react";
import type { MotionValue } from "motion/react";
import type { NameVariant } from "@/config/portfolioData";

import { DepthName } from "./DepthName";
import { ElasticName } from "./ElasticName";
import { GlitchName } from "./GlitchName";
import { HorizonName } from "./HorizonName";
import { KineticName } from "./KineticName";
import { LiquidName } from "./LiquidName";
import { MagneticName } from "./MagneticName";

export interface NameVariantProps {
    lines: string[];
    name: string;
    stage: RefObject<HTMLElement | null>;
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
}

interface NameVariantEntry {
    Component: ComponentType<NameVariantProps>;
    ambient: boolean;
}

export const NAME_VARIANTS: Record<NameVariant, NameVariantEntry> = {
    elastic: { Component: ElasticName, ambient: false },
    horizon: { Component: HorizonName, ambient: false },
    kinetic: { Component: KineticName, ambient: false },
    liquid: { Component: LiquidName, ambient: false },
    magnetic: { Component: MagneticName, ambient: true },
    glitch: { Component: GlitchName, ambient: false },
    depth: { Component: DepthName, ambient: false },
};
