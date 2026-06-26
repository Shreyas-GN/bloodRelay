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
  "/api/alerts/(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  try {
    if (isPublicRoute(req)) return NextResponse.next();

    const { sessionClaims } = await auth.protect();

    // Let users who haven't completed onboarding reach /onboarding
    if (isOnboardingRoute(req)) return NextResponse.next();

    // Check both the JWT claim (authoritative once token rotates, up to ~60s lag)
    // and the bridge cookie set immediately by the server action to cover that gap.
    const jwtComplete = (sessionClaims?.metadata as { onboardingComplete?: boolean } | undefined)
      ?.onboardingComplete;
    const cookieComplete = req.cookies.get("onboarding_complete")?.value === "1";

    if (!jwtComplete && !cookieComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("[middleware] Unhandled error — falling through:", err);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip _next internals, static assets, and common file extensions.
    // The negative lookahead order matters: check path prefixes before extension globs.
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon\\.ico|.*\\.(?:svg|png|jpe?g|gif|webp|ico|css|js|woff2?|ttf|eot|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and trpc routes (catches routes that might match the extension glob above)
    "/(api|trpc)(.*)",
  ],
};
