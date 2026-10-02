import Link from "next/link";
import { portfolio } from "@/config/portfolioData";
import { NavReveal } from "./NavReveal";
import { NavTabs } from "./NavTabs";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Floating navigation pill, 48px tall, one line at every width. Its tabs are
 * set in portfolio.nav: /professional, /projects, /sidequests and the /contact
 * action. The name links home and is hidden below the sm breakpoint so the four
 * tabs and the theme toggle fit on a phone. NavReveal decides when it shows.
 */
export function Header() {
    const { person, nav, ui } = portfolio;

    return (
        <NavReveal>
            <nav
                aria-label={ui.navLabel}
                className="glass pointer-events-auto flex h-12 w-full max-w-[760px] items-center justify-between gap-1 rounded-xl pl-1 pr-1 sm:pl-5"
            >
                <Link
                    href="/"
                    className="min-w-0 shrink truncate text-sm font-medium tracking-tight"
                >
                    {person.name}
                </Link>

                <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                    <NavTabs links={nav.links} cta={nav.cta} />
                    <ThemeToggle label={ui.themeToggleLabel} />
                </div>
            </nav>
        </NavReveal>
    );
}
