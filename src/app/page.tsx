import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

// Temporary landing page. The real one is built in Milestone 11.
export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between gap-2 py-4">
        <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SignedOut>
            <Button asChild variant="ghost">
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </header>
      <main id="main" className="flex flex-1 flex-col justify-center gap-6 pb-16">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Milestone 5: login added
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Every meeting, written up before you close the tab.
        </h1>
        <p className="max-w-prose text-muted-foreground">{siteConfig.tagline}</p>
        <article className="max-w-prose rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="font-serif text-base leading-relaxed">
            Action items get the highlighter: <mark>Finalize Q4 budget draft</mark>.
          </p>
        </article>
      </main>
    </div>
  );
}
