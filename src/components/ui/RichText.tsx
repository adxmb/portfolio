import { Fragment, type ReactNode } from "react";

/**
 * Renders a small, fixed subset of inline markup as React elements:
 *   **bold**   *italic*   `code`
 * Everything else is plain text. No HTML is ever parsed or injected, and React
 * escapes all text nodes, so content can't add tags, attributes or scripts.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

export function RichText({ text }: { text: string }): ReactNode {
    return text.split(TOKEN).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return (
                <code key={index} className="font-mono text-[0.92em]">
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={index}>{part}</Fragment>;
    });
}
