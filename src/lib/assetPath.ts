/**
 * Prepends the site's basePath to a local asset path, since next/image's
 * automatic basePath prefixing isn't reliable with output: "export" combined
 * with images.unoptimized: true. Remote (https) URLs are returned unchanged.
 */
export function assetPath(src: string): string {
    if (/^https?:\/\//.test(src)) return src;
    const basePath = "/portfolio";
    if (!src.startsWith("/")) return `${basePath}/${src}`;
    return `${basePath}${src}`;
}
