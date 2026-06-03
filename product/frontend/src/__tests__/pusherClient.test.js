const mockBind = jest.fn();
const mockUnbind = jest.fn();
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock("pusher-js", () =>
  jest.fn().mockImplementation(() => ({
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
  }))
);

describe("pusher client notification subscriptions", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_PUSHER_KEY = "test-key";
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER = "eu";
    mockSubscribe.mockReturnValue({
      bind: mockBind,
      unbind: mockUnbind,
    });
  });

  it("keeps a shared channel open until the last subscriber unmounts", async () => {
    const { subscribeToNotificationEvents } = await import(
      "../lib/pusherClient"
    );
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();

    const unsubscribeFirst = subscribeToNotificationEvents(
      "user-1",
      firstHandler
    );
    const unsubscribeSecond = subscribeToNotificationEvents(
      "user-1",
      secondHandler
    );

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockBind).toHaveBeenCalledTimes(2);

    unsubscribeFirst();

    expect(mockUnbind).toHaveBeenCalledWith("notification:new", firstHandler);
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    unsubscribeSecond();

    expect(mockUnbind).toHaveBeenCalledWith("notification:new", secondHandler);
    expect(mockUnsubscribe).toHaveBeenCalledWith("private-user-user-1");
  });

  it("binds and unbinds message events on the shared private channel", async () => {
    const { subscribeToMessageEvents } = await import("../lib/pusherClient");
    const onMessageCreated = jest.fn();
    const onTyping = jest.fn();

    const unsubscribe = subscribeToMessageEvents("user-1", {
      onMessageCreated,
      onTyping,
    });

    expect(mockSubscribe).toHaveBeenCalledWith("private-user-user-1");
    expect(mockBind).toHaveBeenCalledWith("message:new", onMessageCreated);
    expect(mockBind).toHaveBeenCalledWith("message:typing", onTyping);

    unsubscribe();

    expect(mockUnbind).toHaveBeenCalledWith("message:new", onMessageCreated);
    expect(mockUnbind).toHaveBeenCalledWith("message:typing", onTyping);
    expect(mockUnsubscribe).toHaveBeenCalledWith("private-user-user-1");
  });

  it("binds and unbinds public post events", async () => {
    const { subscribeToPostEvents } = await import("../lib/pusherClient");
    const onReactionUpdated = jest.fn();
    const onCommentCreated = jest.fn();

    const unsubscribe = subscribeToPostEvents({
      onReactionUpdated,
      onCommentCreated,
    });

    expect(mockSubscribe).toHaveBeenCalledWith("public-posts");
    expect(mockBind).toHaveBeenCalledWith("post:reaction", onReactionUpdated);
    expect(mockBind).toHaveBeenCalledWith("post:comment", onCommentCreated);

    unsubscribe();

    expect(mockUnbind).toHaveBeenCalledWith("post:reaction", onReactionUpdated);
    expect(mockUnbind).toHaveBeenCalledWith("post:comment", onCommentCreated);
    expect(mockUnsubscribe).toHaveBeenCalledWith("public-posts");
  });
});
