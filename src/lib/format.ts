/**
 * Formats "YYYY-MM" or "YYYY-MM-DD" as a short month and year, e.g. "Jan 2024".
 * Returns the input unchanged if it is not a valid date, so a typo in the
 * config shows up on the page instead of crashing the build.
 */
export function formatMonth(value: string, locale: string): string {
  const [year, month] = value.split("-");
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}
