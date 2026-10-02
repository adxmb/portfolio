"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { UI_SPRING } from "@/lib/motion";
import { useScrolledPast } from "@/lib/useScrolledPast";

/**
 * The fixed header frame. On every page except the landing page it is always
 * visible. On the landing page it stays hidden while the name fills the first
 * screen, then slides in once the visitor has scrolled a third of a screen.
 * While hidden it is inert, so it cannot be tabbed to or clicked.
 */
export function NavReveal({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pastName = useScrolledPast(0.35);
  const visible = pathname !== "/" || pastName;

  return (
    <motion.header
      inert={!visible}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -16 }}
      transition={UI_SPRING}
      className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-nav)] flex justify-center px-4 pt-4"
    >
      {children}
    </motion.header>
  );
}
