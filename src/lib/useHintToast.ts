"use client";

import { time } from "console";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Hint {
    id: number;
    message: string;
}

/**
 * Manages a single transient hint. Calling showHint immediately replaces
 * whatever hint is currently active and restarts the auto-dismiss timer —
 * there is never more than one in flight. Decoupled from any particular
 * feature: pass it a message whenever something happens that deserves a
 * brief on-screen nudge (a mode switch, a keyboard-shortcut discovery, a
 * settings change), and pair it with <HintToast hint={hint} /> to render it.
 */
export function useHintToast(durationMs = 3200) {
    const [hint, setHint] = useState<Hint | null>(null);
    const idRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const showHint = useCallback(
        (message: string) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            idRef.current += 1;
            setHint({ id: idRef.current, message });
            timeoutRef.current = setTimeout(() => setHint(null), durationMs);
        },
        [durationMs],
    );

    const clearHint = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHint(null);
    }, []);

    return { hint, showHint, clearHint };
}
