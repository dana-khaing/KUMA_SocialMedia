import middleware from "../middleware"; // Adjust path if needed
import { createRouteMatcher } from "@clerk/nextjs/server";

// Mock only createRouteMatcher
jest.mock("@clerk/nextjs/server", () => ({
  createRouteMatcher: jest.fn((routes) => {
    return jest.fn((req) => {
      const url = new URL(req.url);
      return routes.some((route) =>
        url.pathname.match(new RegExp(route.replace("(.*)", ".*")))
      );
    });
  }),
  clerkMiddleware: jest.fn((handler) => handler),
}));

// Mock Response as a class with a mocked redirect method
class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = new Map(Object.entries(options.headers || {}));
  }

  static redirect = jest.fn((url, status) => {
    return new MockResponse(null, { status, headers: { Location: url } });
  });
}

global.Response = MockResponse;

describe("Clerk Middleware", () => {
  let auth, request;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth object
    auth = {
      protect: jest.fn().mockResolvedValue(undefined), // Default: authenticated
    };

    // Default request object
    request = {
      url: "http://localhost:3000/",
      nextUrl: { origin: "http://localhost:3000" },
    };

    // Set environment variable
    process.env.NEXT_PUBLIC_CLERK_FALLBACK_URL = "/sign-in";

    // Suppress console.error for cleaner output (optional)
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  // for public routes
  it("allows public routes without authentication", async () => {
    const publicRoutes = ["/sign-in", "/sign-up", "/api/webhooks/clerk"];
    for (const route of publicRoutes) {
      request.url = `http://localhost:3000${route}`;
      await middleware(auth, request);
      expect(auth.protect).not.toHaveBeenCalled();
    }
  });

  // for non-public routes
  it("protects non-public routes and allows authenticated users", async () => {
    request.url = "http://localhost:3000/dashboard";
    await middleware(auth, request);
    expect(auth.protect).toHaveBeenCalled();
    expect(MockResponse.redirect).not.toHaveBeenCalled();
  });

  // for unauthenticated users
  it("redirects to sign-in on 404 (unauthenticated) for protected routes", async () => {
    auth.protect.mockRejectedValue({ status: 404 }); // Simulate unauthenticated user
    request.url = "http://localhost:3000/dashboard";
    const response = await middleware(auth, request);
    expect(auth.protect).toHaveBeenCalled();
    expect(MockResponse.redirect).toHaveBeenCalledWith(
      "http://localhost:3000/sign-in",
      302
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "http://localhost:3000/sign-in"
    );
  });

  // for other errors
  it("throws other errors for protected routes", async () => {
    const error = new Error("Server error");
    error.status = 500;
    auth.protect.mockRejectedValue(error);
    request.url = "http://localhost:3000/dashboard";
    await expect(middleware(auth, request)).rejects.toThrow("Server error");
    expect(auth.protect).toHaveBeenCalled();
    expect(MockResponse.redirect).not.toHaveBeenCalled();
  });
});
