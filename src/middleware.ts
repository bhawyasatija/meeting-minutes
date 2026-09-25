import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything is private unless it is listed here. New pages are protected by default.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/share/(.*)", // public read-only reports (Milestone 10)
  "/api/health",
  "/api/webhooks/(.*)", // signed webhooks from Clerk and others (verified in the route itself)
  "/api/uploadthing", // UploadThing's own callback has no Clerk session; file-router.ts checks the user instead
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
