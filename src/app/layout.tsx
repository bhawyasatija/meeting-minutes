import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/source-serif-4";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import "@/lib/env"; // checks required settings when the app starts or builds
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import { authAppearance } from "@/features/auth";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1315" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={authAppearance}>
      <html lang="en" suppressHydrationWarning>
        <body>
          <a
            href="#main"
            className="sr-only rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
          >
            Skip to content
          </a>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
