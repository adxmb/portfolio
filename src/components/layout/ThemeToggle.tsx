"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { THEME_STORAGE_KEY, THEME_TRANSITION_CLASS, THEME_TRANSITION_MS } from "@/lib/theme";

/** Handle of the timer that removes the transition class, so rapid toggles do not cut each other short. */
let transitionTimer: number | undefined;

/**
 * Client leaf: the only interactive piece of the header. The icon swap is done
 * in CSS through the dark: variant, so there is no state and no flash.
 *
 * On click the transition class is added to <html> first, then the theme
 * attribute flips. Every colour on the page is a CSS variable, so once the
 * variables change, the browser blends background, text, border and fill
 * colours over 500ms instead of snapping. The class is removed afterwards so
 * ordinary hover transitions are not affected the rest of the time.
 */
export function ThemeToggle({ label }: { label: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion) {
      root.classList.add(THEME_TRANSITION_CLASS);
      window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => root.classList.remove(THEME_TRANSITION_CLASS), THEME_TRANSITION_MS);
    }

    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked. The theme still changes for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center sm:size-10 rounded-full text-ink transition-[background-color,transform] duration-300 hover:bg-ink/10 active:scale-[0.96]"
    >
      <Moon size={20} weight="regular" aria-hidden="true" className="dark:hidden" />
      <Sun size={20} weight="regular" aria-hidden="true" className="hidden dark:block" />
    </button>
  );
}
