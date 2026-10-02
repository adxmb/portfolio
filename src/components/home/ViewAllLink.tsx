import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

interface ViewAllLinkProps {
    href: string;
    label: string;
}

/** Pill link that opens a subpage. The arrow sits in its own circle and nudges on hover. */
export function ViewAllLink({ href, label }: ViewAllLinkProps) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-3 whitespace-nowrap rounded-2xl py-2 pl-6 pr-2 text-sm font-medium shadow-[0_0_0_1px_var(--hairline)] transition-[background-color,transform] duration-500 ease-spring-out hover:bg-ink/5 active:scale-[0.98]"
        >
            {label}
            <span className="grid size-9 place-items-center rounded-full bg-ink/10 transition-transform duration-500 ease-spring-out group-hover:-translate-y-px group-hover:translate-x-0.5">
                <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
            </span>
        </Link>
    );
}
