import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

// Clerk's ready-made profile screen: name, photo, email, password and active sessions.
export default function ProfilePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <UserProfile path="/profile" routing="path" />
    </div>
  );
}
