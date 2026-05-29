import { auth } from "@clerk/nextjs/server";
import { authorizeNotificationChannel } from "@/lib/pusherServer";
import { POST } from "./route";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/pusherServer", () => ({
  authorizeNotificationChannel: jest.fn(),
}));

function createPusherAuthRequest(fields = {}) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return new Request("http://localhost/api/pusher/auth", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/pusher/auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ userId: "user-1" });
  });

  it("returns 401 when the user is not authenticated", async () => {
    auth.mockResolvedValue({ userId: null });

    const response = await POST(createPusherAuthRequest());

    expect(response.status).toBe(401);
  });

  it("returns 400 when socket or channel fields are missing", async () => {
    const response = await POST(createPusherAuthRequest());

    expect(response.status).toBe(400);
  });

  it("returns 403 when channel authorization fails", async () => {
    authorizeNotificationChannel.mockReturnValue(null);

    const response = await POST(
      createPusherAuthRequest({
        socket_id: "socket-1",
        channel_name: "private-user-other",
      })
    );

    expect(response.status).toBe(403);
  });

  it("returns the channel authorization for the current user", async () => {
    authorizeNotificationChannel.mockReturnValue({ auth: "signed" });

    const response = await POST(
      createPusherAuthRequest({
        socket_id: "socket-1",
        channel_name: "private-user-user-1",
      })
    );

    await expect(response.json()).resolves.toEqual({ auth: "signed" });
    expect(authorizeNotificationChannel).toHaveBeenCalledWith({
      socketId: "socket-1",
      channelName: "private-user-user-1",
      userId: "user-1",
    });
  });
});
