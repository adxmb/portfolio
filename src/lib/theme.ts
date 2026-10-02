/** localStorage key that remembers a manual theme choice. */
export const THEME_STORAGE_KEY = "portfolio-theme";

/**
 * Runs in <head> before first paint. It always sets data-theme on <html> to an
 * explicit "light" or "dark", using the saved choice first and the system
 * preference second. This prevents a flash of the wrong theme.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){}})();`;

/** Class added to <html> for the length of a theme change. Styled in globals.css. */
export const THEME_TRANSITION_CLASS = "theme-transition";

/**
 * How long the class stays on. Keep this a little longer than the transition
 * duration in globals.css (500ms) so the last frame of the blend is not cut off.
 */
export const THEME_TRANSITION_MS = 600;
