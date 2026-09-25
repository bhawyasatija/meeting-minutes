import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main id="main" className="grid min-h-screen place-items-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        {children}
      </div>
    </main>
  );
}
