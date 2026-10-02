"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { ImageAsset } from "@/config/portfolioData";
import { FillImage } from "@/components/ui/FillImage";

/** Peak blur radius in pixels, reached while an image is fully faded out. */
const MAX_BLUR = 34;

interface BlurTransitionProps {
  /** Scroll progress through the story, 0 to 1, already spring-smoothed. */
  progress: MotionValue<number>;
  images: [ImageAsset, ImageAsset];
}

/**
 * Transition type B: liquid blur blend.
 *
 * Between progress 0.25 and 0.75 the first image fades out while dissolving
 * into blur and gaining saturation, and the second fades in from the same
 * blurred, over-saturated state and settles into focus. At the midpoint both
 * are soft and half transparent, so colour flows from one picture into the
 * other instead of one being replaced. The two scales drift toward each other
 * to keep the motion continuous.
 *
 * Only opacity, transform and filter change, so it stays on the GPU.
 */
export function BlurTransition({ progress, images }: BlurTransitionProps) {
  const blend = useTransform(progress, [0.25, 0.75], [0, 1]);

  const firstOpacity = useTransform(blend, [0, 1], [1, 0]);
  const secondOpacity = useTransform(blend, [0, 1], [0, 1]);
  const firstFilter = useTransform(blend, (t) => `blur(${(t * MAX_BLUR).toFixed(1)}px) saturate(${(1 + t * 0.7).toFixed(2)})`);
  const secondFilter = useTransform(
    blend,
    (t) => `blur(${((1 - t) * MAX_BLUR).toFixed(1)}px) saturate(${(1.7 - t * 0.7).toFixed(2)})`,
  );
  const firstScale = useTransform(blend, [0, 1], [1.2, 1.32]);
  const secondScale = useTransform(blend, [0, 1], [1.32, 1.2]);

  return (
    <>
      <motion.div
        style={{ opacity: firstOpacity, filter: firstFilter, scale: firstScale }}
        className="absolute inset-0 will-change-[filter,opacity]"
      >
        <FillImage image={images[0]} priority sizes="100vw" showLabel={false} />
      </motion.div>
      <motion.div
        style={{ opacity: secondOpacity, filter: secondFilter, scale: secondScale }}
        className="absolute inset-0 will-change-[filter,opacity]"
      >
        <FillImage image={images[1]} sizes="100vw" showLabel={false} />
      </motion.div>
    </>
  );
}
