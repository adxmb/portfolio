import { portfolio, type CareerEntry } from "@/config/portfolioData";
import { formatMonth } from "@/lib/format";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "@/components/sections/Section";
import { ViewAllLink } from "./ViewAllLink";

/** Left indent of each entry from md up. Static class names so Tailwind can see them. */
const STAIRS = ["md:ml-0", "md:ml-[14%]", "md:ml-[28%]"] as const;

/**
 * Landing preview of /professional: the most recent roles and studies across
 * all groups, stepped diagonally down and to the right so the eye travels
 * through time. Layout family: staircase. Below md the steps collapse to one
 * flush column.
 */
export function ProfessionalPreview() {
  const { professional, home, meta } = portfolio;
  const entries: CareerEntry[] = professional.groups
    .flatMap((group) => group.entries)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, home.professionalPreviewCount);

  return (
    <Section id="professional-preview" heading={professional.heading} intro={professional.intro} bgSection>
      <RevealGroup className="mt-16">
        <ol className="flex flex-col gap-12">
          {entries.map((entry, index) => (
            <RevealItem
              as="li"
              key={entry.id}
              className={`flex max-w-[52ch] flex-col gap-2 ${STAIRS[index % STAIRS.length]}`}
            >
              <p className="font-mono text-meta text-muted">{formatMonth(entry.startDate, meta.locale)}</p>
              <h3 className="font-display text-h3 font-bold">{entry.title}</h3>
              <p className="text-muted">{entry.organisation}</p>
              <p className="text-muted">{entry.summary}</p>
            </RevealItem>
          ))}
        </ol>
        <div className="mt-12">
          <ViewAllLink href="/professional" label={professional.viewAllLabel} />
        </div>
      </RevealGroup>
    </Section>
  );
}
