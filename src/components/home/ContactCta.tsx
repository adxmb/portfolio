import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { portfolio } from "@/config/portfolioData";
import {
    BoundaryLine,
    RevealGroup,
    RevealItem,
    RevealText,
} from "@/components/motion/Reveal";

/**
 * Closing block of the landing page: one large headline, the contact action and
 * the email address. Left aligned, generous whitespace above, and it ends the
 * page, so there is no footer chrome after it.
 */
export function ContactCta() {
    const { contact, nav, person } = portfolio;

    return (
        <section
            aria-labelledby="contact-cta-title"
            className="px-4 pb-16 pt-24 md:px-8 md:pb-24 md:pt-40"
        >
            <div className="mx-auto max-w-[1400px]">
                <RevealGroup className="flex flex-col items-start">
                    <BoundaryLine />
                    <h2
                        id="contact-cta-title"
                        className="mt-10 max-w-[16ch] text-balance font-display text-display font-extrabold"
                    >
                        <RevealText text={contact.ctaHeadline} />
                    </h2>

                    <RevealItem className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Link
                            href={nav.cta.href}
                            className="group inline-flex items-center gap-3 whitespace-nowrap rounded-2xl bg-accent py-2 pl-6 pr-2 text-sm font-medium text-on-accent transition-transform duration-500 ease-spring-out active:scale-[0.98]"
                        >
                            {nav.cta.label}
                            <span className="grid size-9 place-items-center rounded-full bg-on-accent/10 transition-transform duration-500 ease-spring-out group-hover:-translate-y-px group-hover:translate-x-0.5">
                                <ArrowUpRight
                                    size={18}
                                    weight="bold"
                                    aria-hidden="true"
                                />
                            </span>
                        </Link>

                        <a
                            href={`mailto:${person.email}`}
                            className="text-muted underline decoration-hairline decoration-2 underline-offset-4 transition-colors duration-300 [overflow-wrap:anywhere] hover:text-ink hover:decoration-accent"
                        >
                            {person.email}
                        </a>
                    </RevealItem>
                </RevealGroup>
            </div>
        </section>
    );
}
