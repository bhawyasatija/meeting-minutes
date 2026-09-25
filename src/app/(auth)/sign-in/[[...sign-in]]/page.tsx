import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log in" };

export default function SignInPage() {
  return <SignIn />;
}
