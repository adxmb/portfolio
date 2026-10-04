"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

const SLANT = 16;

interface MaskTransitionProps {
    progress: MotionValue<number>;
    colours: [string, string];
}

export function MaskTransition({ progress, colours }: MaskTransitionProps) {
    const reveal = useTransform(progress, [0.2, 0.8], [0, 1]);
    const clipPath = useTransform(reveal, (t) => {
        const edge = t * (100 + SLANT);
        return `polygon(0% 0%, 100% 0%, 100% ${edge - SLANT}%, 0% ${edge}%)`;
    });
    const firstY = useTransform(progress, [0, 1], ["0%", "-9%"]);
    const secondY = useTransform(progress, [0, 1], ["11%", "0%"]);

    return (
        <>
            <motion.div
                style={{ y: firstY, background: colours[0] }}
                className="absolute inset-0"
            />
            <motion.div style={{ clipPath }} className="absolute inset-0">
                <motion.div
                    style={{ y: secondY, background: colours[1] }}
                    className="absolute inset-0"
                />
            </motion.div>
        </>
    );
}
