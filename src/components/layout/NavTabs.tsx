"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { Link as NavLink } from "@/config/portfolioData";
import { UI_SPRING } from "@/lib/motion";

interface NavTabsProps {
    links: NavLink[];
    cta: NavLink;
}

const isActive = (pathname: string, href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

/** Width of the fade on each scrollable edge, in pixels. */
const FADE = 40;

export function NavTabs({ links, cta }: NavTabsProps) {
    const pathname = usePathname();
    const listRef = useRef<HTMLUListElement>(null);
    const [edges, setEdges] = useState({ left: false, right: false });

    const updateEdges = useCallback(() => {
        const list = listRef.current;
        if (!list) return;
        const left = list.scrollLeft > 1;
        const right = list.scrollLeft + list.clientWidth < list.scrollWidth - 1;
        setEdges((prev) =>
            prev.left === left && prev.right === right ? prev : { left, right },
        );
    }, []);

    // Recheck on scroll, on resize of the list, and once after mount.
    useEffect(() => {
        const list = listRef.current;
        if (!list) return;
        updateEdges();
        list.addEventListener("scroll", updateEdges, { passive: true });
        const observer = new ResizeObserver(updateEdges);
        observer.observe(list);
        void document.fonts?.ready.then(updateEdges);
        return () => {
            list.removeEventListener("scroll", updateEdges);
            observer.disconnect();
        };
    }, [updateEdges]);

    // Keep the active tab visible when the route changes.
    useEffect(() => {
        const list = listRef.current;
        const active = list?.querySelector<HTMLElement>(
            '[aria-current="page"]',
        );
        if (!list || !active) return;
        const target =
            active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
        list.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }, [pathname]);

    const mask = `linear-gradient(to right, transparent 0, #000 ${
        edges.left ? FADE : 0
    }px, #000 calc(100% - ${edges.right ? FADE : 0}px), transparent 100%)`;

    return (
        <>
            <ul
                ref={listRef}
                style={{ maskImage: mask, WebkitMaskImage: mask }}
                className="relative flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {links.map((link) => {
                    const active = isActive(pathname, link.href);
                    return (
                        <li key={link.href} className="shrink-0">
                            <Link
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`relative block rounded-full px-2 py-2 text-[13px] transition-colors duration-300 max-[380px]:px-1.5 sm:px-3 sm:text-sm ${
                                    active
                                        ? "text-ink"
                                        : "text-muted hover:text-ink"
                                }`}
                            >
                                {active ? (
                                    <motion.span
                                        layoutId="nav-active-tab"
                                        transition={UI_SPRING}
                                        className="absolute inset-0 rounded-lg bg-ink/10"
                                    />
                                ) : null}
                                <span className="relative">{link.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <Link
                href={cta.href}
                aria-current={isActive(pathname, cta.href) ? "page" : undefined}
                className="shrink-0 whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-[13px] font-medium text-canvas max-[380px]:px-2.5 sm:px-4 sm:text-sm shadow-[0_0_0_0_var(--accent)] transition-[transform,box-shadow] duration-300 active:scale-[0.98] aria-[current=page]:shadow-[0_0_0_2px_var(--canvas),0_0_0_4px_var(--accent)]"
            >
                {cta.label}
            </Link>
        </>
    );
}
