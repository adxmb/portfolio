import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

interface SectionProps {
    /** Becomes the element id, so it must match the nav href without the "#". */
    id: string;
    heading: string;
    intro?: string;
    className?: string;
    /** Marks this section for the landing page's per-section background manager. Unused on the standalone subpages. */
    bgSection?: boolean;
    children: ReactNode;
}

/** Standard page section: contained width, macro whitespace, shared header. */
export function Section({
    id,
    heading,
    intro,
    className = "",
    bgSection = false,
    children,
}: SectionProps) {
    const titleId = `${id}-title`;

    return (
        <section
            id={id}
            aria-labelledby={titleId}
            data-bg-section={bgSection ? "" : undefined}
            className={`px-4 py-24 md:px-8 md:py-32 ${className}`}
        >
            <div className="mx-auto max-w-[1400px]">
                <SectionHeader id={titleId} heading={heading} intro={intro} />
                {children}
            </div>
        </section>
    );
}
