"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { Hint } from "@/lib/useHintToast";
import { openAsBlob } from "fs";
import { OpenAiLogoIcon } from "@phosphor-icons/react";

interface HintToastProps {
    hint: Hint | null;
}

/**
 * A transient banner that surfaces a usage hint when a name effect that
 * needs one is selected — e.g. "try dragging the letters". Purely
 * informational: it disappears on its own and never blocks input.
 */
export function HintToast({ hint }: HintToastProps) {
    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 top-6 z-[var(--z-overlay)] flex justify-center px-4"
        >
            <AnimatePresence>
                {hint ? (
                    <motion.div
                        key="hint-toast"
                        initial={{ opacity: 0, y: -12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        transition={{ duration: 0.4, ease: EASE_OUT }}
                        className="glass rounded-lg px-4 py-2 text-sm, text-muted"
                    >
                        <motion.span
                            key={hint.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, ease: EASE_OUT }}
                        >
                            {hint.message}
                        </motion.span>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
