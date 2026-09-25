// File: src/components/layout/page-transition.tsx
// Purpose: a small, dependency-free "page transition" — each time the route changes, the new
// page's content rises and fades in instead of popping into place. Uses `key={pathname}` to force
// React to remount the wrapper (and therefore replay the CSS animation) on navigation. Respects
// prefers-reduced-motion via the .animate-fade-up rule in globals.css.
"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
