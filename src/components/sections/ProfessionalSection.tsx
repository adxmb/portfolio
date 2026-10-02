import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { portfolio, type CareerEntry } from "@/config/portfolioData";
import { formatMonth } from "@/lib/format";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "./Section";

function formatRange(entry: CareerEntry, locale: string, presentLabel: string): string {
  const start = formatMonth(entry.startDate, locale);
  if (!entry.endDate) return start;
  const end = entry.endDate === "present" ? presentLabel : formatMonth(entry.endDate, locale);
  return `${start} - ${end}`;
}

/**
 * The /professional page body. A single vertical reading flow: each group
 * (work experience, internships, education) has its title pinned in a left
 * column while its entries scroll past on the right. Nothing scrolls sideways.
 * Below md the title sits above its entries. Group order comes from the config.
 */
export function ProfessionalSection() {
  const { professional, meta } = portfolio;

  return (
    <Section id="professional" heading={professional.heading} intro={professional.intro}>
      <div className="mt-20 flex flex-col gap-24 md:gap-32">
        {professional.groups.map((group) => (
          <section
            key={group.id}
            aria-labelledby={`${group.id}-title`}
            className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:gap-12"
          >
            <h3
              id={`${group.id}-title`}
              className="font-display text-h3 font-bold md:sticky md:top-28 md:self-start"
            >
              {group.heading}
            </h3>

            <RevealGroup>
              <ol className="flex flex-col gap-16">
                {group.entries.map((entry) => (
                  <RevealItem as="li" key={entry.id} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="font-mono text-meta text-muted">
                        {formatRange(entry, meta.locale, professional.presentLabel)}
                      </p>
                      <h4 className="font-display text-h3 font-bold">{entry.title}</h4>
                      <p className="text-muted">
                        {entry.organisation}
                        {entry.location ? `, ${entry.location}` : ""}
                      </p>
                    </div>

                    <p className="max-w-[62ch]">{entry.summary}</p>

                    {entry.highlights.length > 0 ? (
                      <ul className="flex max-w-[62ch] list-disc flex-col gap-2 pl-5 text-muted marker:text-muted">
                        {entry.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    ) : null}

                    {entry.technologies.length > 0 ? (
                      <p className="text-sm text-muted">
                        {professional.technologiesLabel}: {entry.technologies.join(", ")}
                      </p>
                    ) : null}

                    {entry.link ? (
                      <a
                        href={entry.link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium underline decoration-hairline decoration-2 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
                      >
                        {entry.link.label}
                        <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                      </a>
                    ) : null}
                  </RevealItem>
                ))}
              </ol>
            </RevealGroup>
          </section>
        ))}
      </div>
    </Section>
  );
}
