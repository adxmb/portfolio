import { BoundaryLine, RevealGroup, RevealItem, RevealText } from "@/components/motion/Reveal";

interface SectionHeaderProps {
  /** Id for the h2. The section references it with aria-labelledby. */
  id: string;
  heading: string;
  intro?: string;
}

/**
 * Shared opening for every section after the hero: a hairline that draws in,
 * a heading whose words rise out of a mask, then the intro sentence. The
 * heading and intro stack vertically, one message per section.
 */
export function SectionHeader({ id, heading, intro }: SectionHeaderProps) {
  return (
    <RevealGroup className="flex flex-col">
      <BoundaryLine />
      <h2 id={id} className="mt-10 max-w-[18ch] text-balance font-display text-h2 font-bold">
        <RevealText text={heading} />
      </h2>
      {intro ? (
        <RevealItem as="p" className="mt-6 max-w-[56ch] text-lead text-muted">
          {intro}
        </RevealItem>
      ) : null}
    </RevealGroup>
  );
}
