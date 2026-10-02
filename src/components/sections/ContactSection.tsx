import {
    GithubLogo,
    LinkedinLogo,
    MastodonLogo,
    RssSimple,
    XLogo,
    Envelope,
} from "@phosphor-icons/react/dist/ssr";
import { SiLetterboxd } from "@icons-pack/react-simple-icons";
import { portfolio, type SocialIcon } from "@/config/portfolioData";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "./Section";

type Glyph = typeof GithubLogo;

const ICONS: Record<SocialIcon, Glyph> = {
    github: GithubLogo,
    linkedin: LinkedinLogo,
    x: XLogo,
    mastodon: MastodonLogo,
    rss: RssSimple,
    letterboxd: SiLetterboxd,
    email: Envelope,
};

/**
 * Closing section. The email address is the call to action, set as large
 * display type and left aligned. Profile links sit below as pills.
 */
export function ContactSection() {
    const { contact, person } = portfolio;

    return (
        <Section
            id="contact"
            heading={contact.heading}
            intro={contact.intro}
            className="min-h-[80dvh]"
        >
            <RevealGroup className="mt-16 flex flex-col items-start gap-10">
                <RevealItem>
                    <a
                        href={`mailto:${person.email}`}
                        className="block max-w-full font-display text-h2 font-extrabold underline decoration-hairline decoration-2 underline-offset-8 transition-colors duration-300 [overflow-wrap:anywhere] hover:decoration-accent"
                    >
                        {person.email}
                    </a>
                </RevealItem>

                <RevealItem>
                    <ul
                        aria-label={contact.linksLabel}
                        className="flex flex-wrap gap-3"
                    >
                        {contact.links.map((link) => {
                            const Icon = ICONS[link.icon];
                            return (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium shadow-[0_0_0_1px_var(--hairline)] transition-[background-color,transform] duration-300 hover:bg-ink/5 active:scale-[0.98]"
                                    >
                                        <Icon
                                            size={18}
                                            weight="regular"
                                            aria-hidden="true"
                                        />
                                        {link.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </RevealItem>
            </RevealGroup>
        </Section>
    );
}
