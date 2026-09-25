import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { PageTransition } from "./page-transition";
import { SidebarNav } from "./sidebar-nav";

// Layout for every signed-in page: sidebar on large screens, a compact menu row on small ones.
// Milestone 11 upgrades the small-screen menu to a slide-in drawer.
export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[14.5rem_1fr]">
      <aside className="hidden border-r border-border lg:flex lg:flex-col lg:gap-5 lg:p-5">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <Button asChild>
          <Link href="/upload">
            <Plus /> New meeting
          </Link>
        </Button>
        <SidebarNav className="flex-col" />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-2 lg:px-7 lg:py-3">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight lg:hidden">
            {siteConfig.name}
          </Link>
          <SidebarNav className="order-last w-full overflow-x-auto lg:hidden" />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserButton userProfileUrl="/profile" userProfileMode="navigation" />
          </div>
        </header>
        <main id="main" className="flex-1 p-4 lg:p-7">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
