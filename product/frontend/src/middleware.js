import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
]);

const PUBLIC_FILE = /\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$/i;

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request) && !PUBLIC_FILE.test(request.nextUrl.pathname)) {
    try {
      await auth.protect();
    } catch (error) {
      if (error.status === 404) {
        console.error("User not found. Redirecting to sign-in...");
        return Response.redirect(
          new URL(
            process.env.NEXT_PUBLIC_CLERK_FALLBACK_URL || "/sign-in",
            request.nextUrl.origin
          ).toString(),
          302
        );
      }
      throw error; // Rethrow other errors
    }
  }
});

export const config = {
  matcher: [
    // Run Clerk for every app route, including missing static assets that render not-found.
    "/((?!_next).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
