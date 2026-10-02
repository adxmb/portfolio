/**
 * Splits a phrase into at most lineCount lines of similar length, breaking
 * only between words. Used to turn a one-line headline into stacked display
 * lines. A phrase with one word, or a lineCount of one, stays on a single line.
 */
export function balanceLines(text: string, lineCount: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1 || lineCount <= 1) return [words.join(" ")];

  const count = Math.min(lineCount, words.length);
  const target = words.join(" ").length / count;
  const lines: string[] = [];
  let current: string[] = [];

  words.forEach((word, index) => {
    const candidate = [...current, word].join(" ");
    const wordsLeft = words.length - index;
    const linesStillNeeded = count - lines.length - 1;
    const canBreak = current.length > 0 && lines.length < count - 1;
    const overshoots = Math.abs(candidate.length - target) > Math.abs(current.join(" ").length - target);
    const mustBreak = canBreak && wordsLeft <= linesStillNeeded;

    if (canBreak && (overshoots || mustBreak)) {
      lines.push(current.join(" "));
      current = [word];
    } else {
      current.push(word);
    }
  });

  if (current.length > 0) lines.push(current.join(" "));
  return lines;
}
