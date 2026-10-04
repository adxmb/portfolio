import { portfolio } from "@/config/portfolioData";
import { formatMonth } from "@/lib/format";
import {
    SidequestRotator,
    type RotatorItem,
} from "@/components/sidequests/SidequestRotator";
import { Section } from "./Section";

/**
 * The /sidequests page body: a page header, then the orbiting rotator as the
 * one focal component. Entries are sorted newest first, so the most recent
 * sidequest is at the front when the page loads. The rotator receives its
 * dates already formatted, so the client component needs no locale logic.
 */
export function SidequestsSection() {
    const { sidequests, meta } = portfolio;

    const items: RotatorItem[] = [...sidequests.items]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((item) => ({
            id: item.id,
            title: item.title,
            meta: `${sidequests.categories[item.category]}, ${formatMonth(item.date, meta.locale)}`,
            summary: item.summary,
            image: item.image,
            link: item.link,
        }));

    return (
        <Section
            id="sidequests"
            heading={sidequests.heading}
            intro={sidequests.intro}
        >
            <div className="mt-16">
                {items.length === 0 ? (
                    <p className="text-muted">{sidequests.emptyState}</p>
                ) : (
                    <SidequestRotator
                        items={items}
                        label={sidequests.rotatorLabel}
                        hint={sidequests.rotatorHint}
                    />
                )}
            </div>
        </Section>
    );
}
