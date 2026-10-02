import Image from "next/image";
import { portfolio, type ImageAsset } from "@/config/portfolioData";

interface ImageSlotProps {
    image: ImageAsset;
    /** Set on the single largest above-the-fold image so it loads first. */
    priority?: boolean;
    /** Responsive sizes hint for next/image. */
    sizes?: string;
    className?: string;
}

/**
 * Fixed media frame driven entirely by an ImageAsset from the config file.
 * The frame keeps its aspect ratio whether it holds a real image or the
 * labelled placeholder, so swapping content never shifts the layout.
 * Frames are square-cornered by design (content is square, controls are pills).
 */
export function ImageSlot({
    image,
    priority = false,
    sizes,
    className = "",
}: ImageSlotProps) {
    const frameStyle = { aspectRatio: `${image.width} / ${image.height}` };

    if (!image.src) {
        return (
            <div
                role="img"
                aria-label={image.alt}
                style={frameStyle}
                className={`flex w-full flex-col items-start justify-end gap-2 bg-surface p-6 shadow-[0_0_0_1px_var(--hairline)] ${className}`}
            >
                <span className="font-mono text-meta text-muted">
                    {portfolio.ui.placeholderLabel}
                </span>
                <span className="max-w-[32ch] text-sm text-ink">
                    {image.slotLabel}
                </span>
            </div>
        );
    }

    const isRemote = /^https?:\/\//.test(image.src);

    return (
        <div
            style={frameStyle}
            className={`relative w-full overflow-hidden bg-surface ${className}`}
        >
            <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={priority}
                sizes={sizes}
                unoptimized={isRemote}
                draggable={false}
                className="object-cover"
            />
        </div>
    );
}
