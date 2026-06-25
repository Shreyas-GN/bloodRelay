import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/emergency",
  "/request/(.*)",
  "/api/webhooks/clerk",
  "/api/ai/parse-request",
  "/api/auth/(.*)",
  "/api/alerts/(.*)"
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

const clerkDefault = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth.protect();

  // Let users who haven't completed onboarding reach /onboarding
  if (isOnboardingRoute(req)) return;

  // Redirect authenticated users who haven't finished onboarding
  const onboardingComplete = (sessionClaims?.metadata as { onboardingComplete?: boolean } | undefined)?.onboardingComplete;
  if (!onboardingComplete) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
});

export default async function middleware(req: any, event: any) {
  return clerkDefault(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
