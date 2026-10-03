import Image from "next/image";
import { portfolio, type ImageAsset } from "@/config/portfolioData";
import { assetPath } from "@/lib/assetPath";

interface FillImageProps {
    image: ImageAsset;
    /** Set on the largest above-the-fold image so it loads first. */
    priority?: boolean;
    /** Responsive sizes hint for next/image. */
    sizes: string;
    /** Show the "Placeholder image" label and slot instructions when src is empty. */
    showLabel?: boolean;
}

/**
 * An image that fills whatever positioned parent it is placed in, cropping to
 * cover. Unlike ImageSlot it does not set its own aspect ratio, so it is the
 * right choice for backgrounds, the orbit thumbnails and the centre frame.
 * With no src it draws the same labelled placeholder as ImageSlot.
 */
export function FillImage({
    image,
    priority = false,
    sizes,
    showLabel = true,
}: FillImageProps) {
    if (!image.src) {
        return (
            <div
                role="img"
                aria-label={image.alt}
                className="absolute inset-0 flex flex-col items-start justify-end gap-2 bg-surface p-6"
            ></div>
        );
    }

    const isRemote = /^https?:\/\//.test(image.src);

    return (
        <Image
            src={assetPath(image.src)}
            alt={image.alt}
            fill
            priority={priority}
            sizes={sizes}
            unoptimized={isRemote}
            draggable={false}
            className="object-cover"
        />
    );
}
