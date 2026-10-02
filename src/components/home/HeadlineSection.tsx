import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { portfolio } from "@/config/portfolioData";

/**
 * The grounding anchor under the animated name. Deliberately static: no motion,
 * no pointer response, just a clear template. The headline is set large across
 * eight of twelve columns, and the supporting sentence and the two actions sit
 * in the remaining four, aligned to the headline's baseline. Below md the two
 * blocks stack. Everything comes from portfolio.hero.
 */
export function HeadlineSection() {
    const { hero } = portfolio;

    return (
        <section
            data-bg-section=""
            aria-labelledby="headline-title"
            className="relative flex min-h-[100dvh] items-center px-4 py-28 md:px-8"
        >
            <div className="mx-auto grid w-full max-w-[1400px] gap-12 md:grid-cols-12 md:items-end md:gap-8">
                <h2
                    id="headline-title"
                    className="text-balance font-display text-headline font-extrabold md:col-span-8"
                >
                    {hero.headline}
                </h2>

                <div className="flex flex-col items-start gap-8 md:col-span-4">
                    <p className="max-w-[40ch] text-lead text-muted">
                        {hero.subtext}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={hero.primaryCta.href}
                            className="group inline-flex items-center gap-3 whitespace-nowrap rounded-2xl bg-accent py-2 pl-6 pr-2 text-sm font-medium text-on-accent transition-transform duration-500 ease-spring-out active:scale-[0.98]"
                        >
                            {hero.primaryCta.label}
                            <span className="grid size-9 place-items-center rounded-full bg-on-accent/10 transition-transform duration-500 ease-spring-out group-hover:-translate-y-px group-hover:translate-x-0.5">
                                <ArrowUpRight
                                    size={18}
                                    weight="bold"
                                    aria-hidden="true"
                                />
                            </span>
                        </Link>

                        <Link
                            href={hero.secondaryCta.href}
                            className="inline-flex items-center whitespace-nowrap rounded-2xl px-6 py-3.5 text-sm font-medium text-ink shadow-[0_0_0_1px_var(--hairline)] transition-[background-color,transform] duration-300 hover:bg-ink/5 active:scale-[0.98]"
                        >
                            {hero.secondaryCta.label}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
