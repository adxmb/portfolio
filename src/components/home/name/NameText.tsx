import { Fragment, type CSSProperties, type ReactNode } from "react";

interface NameTextProps {
  /** The name, already split into lines. */
  lines: string[];
  /** Renders one letter. Receives the letter and its running index across the whole name. */
  renderChar: (char: string, index: number) => ReactNode;
}

/**
 * Splits a name into lines, words and letters and lets each variant decide how
 * a letter behaves. Every level keeps transform-style: preserve-3d so a letter
 * pushed toward the viewer is drawn in the same 3D space as its neighbours
 * instead of being flattened into its line. Each letter also gets the CSS entry
 * animation (.char-in), staggered by its index.
 *
 * Words are kept unbreakable, so the name only ever wraps between words. The
 * whole thing is hidden from assistive technology, because the heading that
 * contains it carries the real name as its label.
 */
export function NameText({ lines, renderChar }: NameTextProps) {
  let index = 0;

  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} aria-hidden="true" className="block [transform-style:preserve-3d]">
          {line.split(" ").map((word, wordIndex) => (
            <Fragment key={`${word}-${wordIndex}`}>
              {wordIndex > 0 ? " " : null}
              <span className="inline-block whitespace-nowrap [transform-style:preserve-3d]">
                {Array.from(word).map((char) => {
                  const current = index++;
                  return (
                    <span
                      key={current}
                      className="char-in inline-block [transform-style:preserve-3d]"
                      style={{ "--i": current } as CSSProperties}
                    >
                      {renderChar(char, current)}
                    </span>
                  );
                })}
              </span>
            </Fragment>
          ))}
        </span>
      ))}
    </>
  );
}
