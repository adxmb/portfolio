"use client";

import { useHomePreview } from "./HomePreviewContext";
import { HintToast } from "../ui/HintToast";

/** Reads the active name-effect hint from context and renders it as a toast. */
export function NameHintToast() {
    const { hint } = useHomePreview();
    return <HintToast hint={hint} />;
}
