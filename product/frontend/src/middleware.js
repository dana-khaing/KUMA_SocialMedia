import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
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
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
