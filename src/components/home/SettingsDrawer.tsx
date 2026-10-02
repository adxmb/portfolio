"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Gear, X } from "@phosphor-icons/react";
import {
    accentPresetColours,
    type AccentPreset,
    type BackgroundTransitionType,
    type NameVariant,
} from "@/config/portfolioData";
import { EASE_OUT, UI_SPRING } from "@/lib/motion";
import { Segmented } from "./Segmented";
import { useHomePreview } from "./HomePreviewContext";

interface SettingsDrawerProps {
    toggleLabel: string;
    groupLabel: string;
    nameLabel: string;
    nameOptions: Record<NameVariant, string>;
    backgroundLabel: string;
    backgroundOptions: Record<BackgroundTransitionType, string>;
    accentLabel: string;
    accentOptions: Record<AccentPreset, string>;
}

/**
 * A single cog button, fixed to the bottom right of the landing page. Clicking
 * it expands a small drawer holding the name-effect and background-transition
 * switches; clicking the cog again, clicking outside the drawer, or pressing
 * Escape collapses it. The drawer animates open and closed rather than
 * appearing instantly, and the cog rotates a quarter turn while it is open as
 * a small acknowledgement of the state change.
 *
 * This replaces having both switches sit permanently on the page: the controls
 * are for comparing options while you decide on them, not part of the finished
 * design, so they stay tucked away until asked for. Because Segmented already
 * loops over whatever keys are in `options`, this drawer needs zero changes as
 * you add or remove name variants — only nameOptions in the config changes.
 */
export function SettingsDrawer({
    toggleLabel,
    groupLabel,
    nameLabel,
    nameOptions,
    backgroundLabel,
    backgroundOptions,
    accentLabel,
    accentOptions,
}: SettingsDrawerProps) {
    const {
        nameVariant,
        setNameVariant,
        backgroundTransition,
        setBackgroundTransition,
    } = useHomePreview();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const { accentPreset, setAccentPreset } = useHomePreview();

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node))
                setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div
            ref={rootRef}
            className="fixed bottom-4 right-4 z-[var(--z-overlay)] flex flex-col items-end gap-2"
        >
            <AnimatePresence>
                {open ? (
                    <motion.div
                        role="group"
                        aria-label={groupLabel}
                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 10 }}
                        transition={{ duration: 0.22, ease: EASE_OUT }}
                        style={{ transformOrigin: "100% 100%" }}
                        className="glass flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-3 rounded-xl p-3"
                    >
                        <LayoutGroup id="settings-drawer">
                            <Segmented
                                name="name"
                                label={nameLabel}
                                options={nameOptions}
                                value={nameVariant}
                                onChange={setNameVariant}
                            />
                            <Segmented
                                name="background"
                                label={backgroundLabel}
                                options={backgroundOptions}
                                value={backgroundTransition}
                                onChange={setBackgroundTransition}
                            />
                            <Segmented
                                name="accent"
                                label={accentLabel}
                                options={accentOptions}
                                value={accentPreset}
                                onChange={setAccentPreset}
                                swatches={accentPresetColours}
                            />
                        </LayoutGroup>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <motion.button
                type="button"
                aria-label={toggleLabel}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                animate={{ rotate: open ? 90 : 0 }}
                transition={UI_SPRING}
                className="glass grid size-11 place-items-center rounded-full text-ink transition-colors duration-300 hover:bg-ink/10"
            >
                {open ? (
                    <X size={18} weight="bold" aria-hidden="true" />
                ) : (
                    <Gear size={18} weight="regular" aria-hidden="true" />
                )}
            </motion.button>
        </div>
    );
}
