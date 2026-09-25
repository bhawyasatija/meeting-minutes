"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={cn("flex gap-1", className)}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-[background-color,color,box-shadow,transform] duration-150 ease-out hover:translate-x-0.5 hover:bg-secondary hover:text-foreground lg:min-h-9",
              active &&
                "bg-secondary font-medium text-foreground shadow-[inset_2px_0_0_var(--primary)] hover:translate-x-0",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
