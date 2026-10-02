import { portfolio } from "@/config/portfolioData";
import { formatMonth } from "@/lib/format";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "@/components/sections/Section";
import { ViewAllLink } from "./ViewAllLink";
import { RichText } from "../ui/RichText";

/**
 * Landing preview of /sidequests: the two newest entries as an asymmetric pair,
 * a wide frame on the left and a narrower one on the right, aligned along the
 * bottom. Layout family: asymmetric image pair.
 */
export function SidequestsPreview() {
    const { sidequests, home, meta } = portfolio;
    const items = [...sidequests.items]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, home.sidequestsPreviewCount);

    return (
        <Section
            id="sidequests-preview"
            heading={sidequests.heading}
            intro={sidequests.intro}
            bgSection
        >
            {items.length === 0 ? (
                <p className="mt-16 text-muted">{sidequests.emptyState}</p>
            ) : (
                <RevealGroup className="mt-16">
                    <ul className="grid gap-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-end md:gap-16">
                        {items.map((item) => (
                            <RevealItem
                                as="li"
                                key={item.id}
                                className="flex flex-col gap-5"
                            >
                                <ImageSlot
                                    image={item.image}
                                    sizes="(min-width: 768px) 54vw, 92vw"
                                    className="max-h-[30vh] md:max-h-[40vh]"
                                />
                                <div className="flex flex-col gap-2">
                                    <p className="font-mono text-meta text-muted">
                                        {sidequests.categories[item.category]},{" "}
                                        {formatMonth(item.date, meta.locale)}
                                    </p>
                                    <h3 className="font-display text-h3 font-bold">
                                        {item.title}
                                    </h3>
                                    <p className="max-w-[46ch] text-muted">
                                        <RichText text={item.summary} />
                                    </p>
                                </div>
                            </RevealItem>
                        ))}
                    </ul>
                    <div className="mt-12">
                        <ViewAllLink
                            href="/sidequests"
                            label={sidequests.viewAllLabel}
                        />
                    </div>
                </RevealGroup>
            )}
        </Section>
    );
}
