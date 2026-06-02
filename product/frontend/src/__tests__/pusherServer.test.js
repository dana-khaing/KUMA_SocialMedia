const mockTrigger = jest.fn();
const mockAuthorizeChannel = jest.fn();
const mockPusherConstructor = jest.fn();

jest.mock("pusher", () =>
  jest.fn().mockImplementation((config) => {
    mockPusherConstructor(config);
    return {
      trigger: mockTrigger,
      authorizeChannel: mockAuthorizeChannel,
    };
  })
);

describe("pusher server helpers", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.PUSHER_APP_ID;
    delete process.env.PUSHER_KEY;
    delete process.env.PUSHER_SECRET;
    delete process.env.PUSHER_CLUSTER;
    delete process.env.NEXT_PUBLIC_PUSHER_KEY;
    delete process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  });

  it("does nothing when Pusher env is missing", async () => {
    const { triggerNotificationCreated } = await import("../lib/pusherServer");

    await triggerNotificationCreated({ receiverId: "user-1" });

    expect(mockPusherConstructor).not.toHaveBeenCalled();
    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it("triggers a private notification event when configured", async () => {
    process.env.PUSHER_APP_ID = "app";
    process.env.PUSHER_KEY = "key";
    process.env.PUSHER_SECRET = "secret";
    process.env.PUSHER_CLUSTER = "eu";
    const { triggerNotificationCreated } = await import("../lib/pusherServer");

    await triggerNotificationCreated({
      id: 1,
      type: "FOLLOW_REQUEST",
      message: "Follow request",
      createdAt: new Date("2026-05-29T10:00:00.000Z"),
      read: false,
      senderId: "user-2",
      receiverId: "user-1",
      sender: { id: "user-2", name: "Dana", surname: "K", avatar: null },
    });

    expect(mockTrigger).toHaveBeenCalledWith(
      "private-user-user-1",
      "notification:new",
      expect.objectContaining({
        id: 1,
        type: "FOLLOW_REQUEST",
        createdAt: "2026-05-29T10:00:00.000Z",
        sender: expect.objectContaining({ id: "user-2" }),
      })
    );
  });

  it("triggers private message and typing events when configured", async () => {
    process.env.PUSHER_APP_ID = "app";
    process.env.PUSHER_KEY = "key";
    process.env.PUSHER_SECRET = "secret";
    process.env.PUSHER_CLUSTER = "eu";
    const { triggerMessageCreated, triggerMessageTyping } = await import(
      "../lib/pusherServer"
    );

    await triggerMessageCreated({
      receiverId: "user-1",
      message: {
        id: 2,
        conversationId: 10,
        senderId: "user-2",
        body: "Hello",
        createdAt: new Date("2026-06-02T10:00:00.000Z"),
        sender: { id: "user-2", username: "dana" },
      },
    });
    await triggerMessageTyping({
      receiverId: "user-1",
      conversationId: 10,
      userId: "user-2",
    });

    expect(mockTrigger).toHaveBeenCalledWith(
      "private-user-user-1",
      "message:new",
      expect.objectContaining({
        id: 2,
        conversationId: 10,
        body: "Hello",
        createdAt: "2026-06-02T10:00:00.000Z",
      })
    );
    expect(mockTrigger).toHaveBeenCalledWith(
      "private-user-user-1",
      "message:typing",
      {
        conversationId: 10,
        userId: "user-2",
      }
    );
  });

  it("swallows trigger failures so DB writes can still succeed", async () => {
    process.env.PUSHER_APP_ID = "app";
    process.env.PUSHER_KEY = "key";
    process.env.PUSHER_SECRET = "secret";
    process.env.PUSHER_CLUSTER = "eu";
    mockTrigger.mockRejectedValue(new Error("Pusher down"));
    const { triggerNotificationCreated } = await import("../lib/pusherServer");

    await expect(
      triggerNotificationCreated({ receiverId: "user-1" })
    ).resolves.toBeUndefined();
  });

  it("authorizes only the authenticated user's private channel", async () => {
    process.env.PUSHER_APP_ID = "app";
    process.env.PUSHER_KEY = "key";
    process.env.PUSHER_SECRET = "secret";
    process.env.PUSHER_CLUSTER = "eu";
    mockAuthorizeChannel.mockReturnValue({ auth: "signed" });
    const { authorizeNotificationChannel } = await import(
      "../lib/pusherServer"
    );

    expect(
      authorizeNotificationChannel({
        socketId: "socket-1",
        channelName: "private-user-user-1",
        userId: "user-1",
      })
    ).toEqual({ auth: "signed" });
    expect(
      authorizeNotificationChannel({
        socketId: "socket-1",
        channelName: "private-user-other",
        userId: "user-1",
      })
    ).toBeNull();
  });
});
