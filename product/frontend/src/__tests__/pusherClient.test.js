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
});
