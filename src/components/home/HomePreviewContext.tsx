"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    accentPresetColours,
    isAccentPreset,
    type AccentPreset,
    type BackgroundTransitionType,
    type NameVariant,
} from "@/config/portfolioData";
import { useHintToast, type Hint } from "@/lib/useHintToast";
import { pre } from "motion/react-client";

interface HomePreviewValue {
    nameVariant: NameVariant;
    setNameVariant: (variant: NameVariant) => void;
    backgroundTransition: BackgroundTransitionType;
    setBackgroundTransition: (type: BackgroundTransitionType) => void;
    accentPreset: AccentPreset;
    setAccentPreset: (preset: AccentPreset) => void;
    hint: Hint | null;
}

const HomePreviewContext = createContext<HomePreviewValue | null>(null);
const ACCENT_STORAGE_KEY = "preview-accent-colour";

export function useHomePreview(): HomePreviewValue {
    const value = useContext(HomePreviewContext);
    if (!value) {
        throw new Error(
            "useHomePreview must be used inside <HomePreviewProvider>.",
        );
    }
    return value;
}

interface HomePreviewProviderProps {
    /** Starting choices, from portfolio.home in the config file. */
    defaults: {
        nameVariant: NameVariant;
        backgroundTransition: BackgroundTransitionType;
        accentPreset: AccentPreset;
    };
    nameVariantHints?: Partial<Record<NameVariant, string>>;
    hintDurationMs?: number;
    children: ReactNode;
}

/**
 * Holds which name effect and which background transition are showing, so the
 * switch panel and the components it controls stay in step. The starting values
 * come from the config, so making a choice permanent means editing two values
 * there.
 */
export function HomePreviewProvider({
    defaults,
    nameVariantHints,
    hintDurationMs = 3200,
    children,
}: HomePreviewProviderProps) {
    const [nameVariant, setNameVariantState] = useState<NameVariant>(
        defaults.nameVariant,
    );
    const [backgroundTransition, setBackgroundTransition] =
        useState<BackgroundTransitionType>(defaults.backgroundTransition);
    const [accentPreset, setAccentPresetState] = useState<AccentPreset>(
        defaults.accentPreset,
    );
    const { hint, showHint } = useHintToast(hintDurationMs);

    useEffect(() => {
        const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
        if (stored && stored in accentPresetColours)
            setAccentPresetState(stored as AccentPreset);
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--accent",
            accentPresetColours[accentPreset],
        );
    }, [accentPreset]);

    const setAccentPreset = (preset: AccentPreset) => {
        setAccentPresetState(preset);
        window.localStorage.setItem(ACCENT_STORAGE_KEY, preset);
    };

    const setNameVariant = useCallback(
        (variant: NameVariant) => {
            setNameVariantState(variant);
            const message = nameVariantHints?.[variant];
            if (message) showHint(message);
        },
        [nameVariantHints, showHint],
    );

    const value = useMemo(
        () => ({
            nameVariant,
            setNameVariant,
            backgroundTransition,
            setBackgroundTransition,
            accentPreset,
            setAccentPreset,
            hint,
        }),
        [nameVariant, backgroundTransition, accentPreset, hint],
    );

    return (
        <HomePreviewContext.Provider value={value}>
            {children}
        </HomePreviewContext.Provider>
    );
}
