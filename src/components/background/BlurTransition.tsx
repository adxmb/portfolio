"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

const MAX_BLUR = 34;

interface BlurTransitionProps {
    progress: MotionValue<number>;
    colours: [string, string];
}

export function BlurTransition({ progress, colours }: BlurTransitionProps) {
    const blend = useTransform(progress, [0.25, 0.75], [0, 1]);

    const firstOpacity = useTransform(blend, [0, 1], [1, 0]);
    const secondOpacity = useTransform(blend, [0, 1], [0, 1]);

    return (
        <>
            <motion.div
                style={{ opacity: firstOpacity, background: colours[0] }}
                className="absolute inset-0"
            />
            <motion.div
                style={{ opacity: secondOpacity, background: colours[1] }}
                className="absolute inset-0"
            />
        </>
    );
}
