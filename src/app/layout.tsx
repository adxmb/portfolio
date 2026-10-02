import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { portfolio } from "@/config/portfolioData";
import { themeInitScript } from "@/lib/theme";
import { Header } from "@/components/layout/Header";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { SiteBackdrop } from "@/components/SiteBackdrop";
import "./globals.css";

/**
 * Cabinet Grotesk is self-hosted. Download it free from Fontshare and place
 * the variable file at src/fonts/CabinetGrotesk-Variable.woff2 (see README).
 */
const cabinet = localFont({
    src: "../fonts/CabinetGrotesk-Variable.woff2",
    variable: "--font-cabinet",
    weight: "100 800",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(portfolio.meta.siteUrl),
    title: {
        default: portfolio.meta.title,
        template: portfolio.meta.titleTemplate,
    },
    description: portfolio.meta.description,
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#e8eceb" },
        { media: "(prefers-color-scheme: dark)", color: "#0e1113" },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { ui, meta } = portfolio;

    return (
        <html
            lang={meta.locale}
            suppressHydrationWarning
            className={`${GeistSans.variable} ${GeistMono.variable} ${cabinet.variable}`}
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body>
                <a
                    href="#main"
                    className="sr-only rounded-full bg-ink px-4 py-2 text-sm text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-overlay)]"
                >
                    {ui.skipToContent}
                </a>
                <SmoothScrollProvider>
                    <Header />
                    <main id="main" className="relative isolate">
                        <SiteBackdrop />
                        {children}
                    </main>
                </SmoothScrollProvider>
            </body>
        </html>
    );
}
