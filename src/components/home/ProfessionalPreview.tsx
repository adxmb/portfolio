import { portfolio, type CareerEntry } from "@/config/portfolioData";
import { formatMonth } from "@/lib/format";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "@/components/sections/Section";
import { ViewAllLink } from "./ViewAllLink";

/**
 * Landing preview of /professional: the most recent roles and studies across
 * all groups. Each entry spans the section as a two-column row, date and
 * title on the left, organisation and summary on the right, so the content
 * actually uses the section's width rather than sitting in one narrow column.
 */
export function ProfessionalPreview() {
    const { professional, home, meta } = portfolio;
    const entries: CareerEntry[] = professional.groups
        .flatMap((group) => group.entries)
        .sort((a, b) => b.startDate.localeCompare(a.startDate))
        .slice(0, home.professionalPreviewCount);

    return (
        <Section
            id="professional-preview"
            heading={professional.heading}
            intro={professional.intro}
            bgSection
        >
            <RevealGroup className="mt-16">
                <ol className="flex flex-col">
                    {entries.map((entry) => (
                        <RevealItem
                            as="li"
                            key={entry.id}
                            className="grid gap-4 border-t border-hairline py-10 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16"
                        >
                            <div className="flex flex-col gap-2">
                                <p className="font-mono text-meta text-muted">
                                    {formatMonth(entry.startDate, meta.locale)}
                                </p>
                                <h3 className="text-balance font-display text-h2 font-bold">
                                    {entry.title}
                                </h3>
                            </div>
                            <div className="flex flex-col gap-3 md:pt-1">
                                <p className="font-medium text-ink">
                                    {entry.organisation}
                                </p>
                                <p className="max-w-[56ch] text-muted text-muted">
                                    {entry.summary}
                                </p>
                            </div>
                        </RevealItem>
                    ))}
                </ol>
                <div className="mt-12">
                    <ViewAllLink
                        href="/professional"
                        label={professional.viewAllLabel}
                    />
                </div>
            </RevealGroup>
        </Section>
    );
}
