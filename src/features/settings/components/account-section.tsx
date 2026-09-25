// File: src/features/settings/components/account-section.tsx
// Purpose: who you are and a way out. Editing profile fields (name, photo) is handled by Clerk's
// own /profile page (already linked from the header's UserButton) — not duplicated here.
import { SignOutButton } from "@clerk/nextjs";
import type { User } from "@prisma/client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountSection({ user }: { user: User }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{user.email ?? "Not set"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Member since</p>
          <p className="text-sm font-medium">
            {user.createdAt.toLocaleDateString("en", { dateStyle: "medium" })}
          </p>
        </div>
      </div>
      <SignOutButton>
        <Button variant="outline" size="sm">
          <LogOut /> Sign out
        </Button>
      </SignOutButton>
    </div>
  );
}
