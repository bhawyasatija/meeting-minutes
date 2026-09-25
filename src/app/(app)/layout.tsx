import { AppShell } from "@/components/layout/app-shell";

// All pages in this group require login (enforced by src/middleware.ts).
export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
