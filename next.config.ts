import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    /**
     * Hides the floating Next.js badge that appears in the bottom-left corner
     * during `npm run dev`. It is a development-only overlay and never ships in
     * a production build.
     */
    devIndicators: false,
};

module.exports = {
    allowedDevOrigins: ["192.168.86.31"],
};

export default nextConfig;
