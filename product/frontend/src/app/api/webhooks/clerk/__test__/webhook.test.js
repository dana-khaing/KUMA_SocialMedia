import { POST } from "../route";
import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/client";

// Mock dependencies
jest.mock("svix", () => {
  const mockVerify = jest.fn(); // Create a standalone mock for verify
  return {
    Webhook: jest.fn().mockImplementation(() => ({
      verify: mockVerify, // Return the mockVerify function
    })),
  };
});
jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));
jest.mock("@/lib/client", () => ({
  user: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("POST /api/webhooks/clerk", () => {
  let req;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SIGNING_SECRET = "test-secret";
    const mockHeaders = new Map([
      ["svix-id", "test-id"],
      ["svix-timestamp", "1234567890"],
      ["svix-signature", "test-signature"],
    ]);
    headers.mockReturnValue({
      get: (key) => mockHeaders.get(key),
    });
    req = {
      json: jest.fn().mockResolvedValue({
        id: "user-123",
        type: "user.created", // Default event type
        data: {
          id: "user-123",
          username: "testuser",
          first_name: "John",
          last_name: "Doe",
          image_url: "http://example.com/avatar.jpg",
        },
      }),
    };
  });

  it("returns 400 if Svix headers are missing", async () => {
    headers.mockReturnValue({
      get: () => null,
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Error: Missing Svix headers");
  });

  // test for the user.created event while testing for webhook endpoint
  it("creates a user on user.created event", async () => {
    const mockVerify = jest.fn();
    Webhook.mockImplementation(() => ({
      verify: mockVerify,
    }));
    mockVerify.mockReturnValue({
      id: "user-123",
      type: "user.created",
      data: {
        id: "user-123",
        username: "testuser",
        first_name: "John",
        last_name: "Doe",
        image_url: "http://example.com/avatar.jpg",
      },
    });
    prisma.user.create.mockResolvedValue({ id: "user-123" });

    const response = await POST(req);

    expect(mockVerify).toHaveBeenCalled();
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        id: "user-123",
        username: "testuser",
        avatar: "http://example.com/avatar.jpg",
        name: "John",
        surname: "Doe",
        cover: "/stories1.jpg",
      },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("User has been created!.");
  });
});
