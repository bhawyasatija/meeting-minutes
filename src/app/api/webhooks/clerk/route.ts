// File: src/app/api/webhooks/clerk/route.ts
// Purpose: receives signed messages from Clerk ("a user was created / changed / deleted") and
// keeps our User table in step. Public in middleware.ts, so it protects itself by checking
// Clerk's signature. Not needed on localhost (users are saved on first visit); switch it on before deploying.
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { z } from "zod";
import { deleteUserByClerkId, upsertUser } from "@/features/auth";
import { env } from "@/lib/env";

const envelope = z.object({ type: z.string(), data: z.unknown() });

const userData = z.object({
  id: z.string(),
  primary_email_address_id: z.string().nullish(),
  email_addresses: z.array(z.object({ id: z.string(), email_address: z.string() })).default([]),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  image_url: z.string().nullish(),
});

const deletedData = z.object({ id: z.string() });

export async function POST(req: Request) {
  const secret = env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  // 1. Check the signature against the RAW body. Anything unsigned or altered is rejected.
  const payload = await req.text();
  const h = await headers();
  let event: z.infer<typeof envelope>;
  try {
    const verified = new Webhook(secret).verify(payload, {
      "svix-id": h.get("svix-id") ?? "",
      "svix-timestamp": h.get("svix-timestamp") ?? "",
      "svix-signature": h.get("svix-signature") ?? "",
    });
    event = envelope.parse(verified);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 2. Act on the events we care about; acknowledge (200) all others so Clerk stops retrying them.
  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      const user = userData.parse(event.data);
      const primary =
        user.email_addresses.find((e) => e.id === user.primary_email_address_id) ??
        user.email_addresses[0];
      await upsertUser({
        clerkId: user.id,
        email: primary?.email_address ?? null,
        name: [user.first_name, user.last_name].filter(Boolean).join(" ") || null,
        imageUrl: user.image_url ?? null,
      });
    } else if (event.type === "user.deleted") {
      await deleteUserByClerkId(deletedData.parse(event.data).id);
    }
  } catch (error) {
    // 500 makes Clerk retry later, which is what we want for a temporary database problem.
    console.error("Clerk webhook failed", { type: event.type, error });
    return NextResponse.json({ error: "Could not process event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
