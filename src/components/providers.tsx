"use client";

import { ThemeProvider } from "next-themes";

// Client-side providers live here. Later milestones add Clerk and TanStack Query.
export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
