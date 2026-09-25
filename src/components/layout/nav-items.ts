import { Clock, LayoutDashboard, SlidersHorizontal, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// The three main destinations from the Milestone 3 navigation design.
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];
