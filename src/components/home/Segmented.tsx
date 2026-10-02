"use client";

import { motion } from "motion/react";
import { UI_SPRING } from "@/lib/motion";

interface SegmentedProps<T extends string> {
    name: string;
    label: string;
    options: Record<T, string>;
    value: T;
    onChange: (value: T) => void;
    swatches?: Record<T, string>;
}

export function Segmented<T extends string>({
    name,
    label,
    options,
    value,
    onChange,
    swatches,
}: SegmentedProps<T>) {
    const ids = Object.keys(options) as T[];

    return (
        <div className="flex flex-col gap-1.5">
            <span className="px-1 text-xs text-muted">{label}</span>
            <div
                role="radiogroup"
                aria-label={label}
                className="flex flex-wrap gap-1 rounded-xl bg-ink/8 p-1"
            >
                {ids.map((id) => {
                    const selected = id === value;
                    return (
                        <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(id)}
                            className={`relative rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors duration-300 ${
                                selected
                                    ? "text-canvas"
                                    : "text-muted hover:text-ink"
                            }`}
                        >
                            {selected ? (
                                <motion.span
                                    layoutId={`segmented-${name}`}
                                    transition={UI_SPRING}
                                    className="absolute inset-0 rounded-lg bg-ink"
                                />
                            ) : null}
                            <span className="relative inline-flex items-center gap-1.5">
                                {swatches && selected ? (
                                    <span
                                        aria-hidden="true"
                                        className="size-3 rounded-full"
                                        style={{
                                            background: swatches[id],
                                            boxShadow:
                                                "0 0 0 1px var(--hairline)",
                                        }}
                                    />
                                ) : null}
                                {options[id]}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
