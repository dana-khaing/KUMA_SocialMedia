/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Notification from "@/components/activity/notification";
import {
  clearReadNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/action";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockPrefetch = jest.fn();
let realtimeHandler;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  }),
}));

jest.mock("@/lib/pusherClient", () => ({
  subscribeToNotificationEvents: jest.fn((userId, handler) => {
    realtimeHandler = handler;
    return jest.fn();
  }),
}));

jest.mock("@/components/navbar/notificationBadge", () => ({
  NOTIFICATION_CHANGED_EVENT: "kuma:notifications-changed",
}));

jest.mock("@/lib/action", () => ({
  clearReadNotifications: jest.fn(),
  deleteNotification: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  markNotificationAsRead: jest.fn(),
}));

const notifications = [
  {
    id: 1,
    type: "POST_LIKED",
    message: "Dana liked your post.",
    createdAt: "2026-05-29T10:00:00.000Z",
    read: false,
    senderId: "user-2",
    postId: 10,
    sender: { avatar: null },
  },
  {
    id: 2,
    type: "COMMENT",
    message: "Alex commented on your post.",
    createdAt: "2026-05-29T09:00:00.000Z",
    read: true,
    senderId: "user-3",
    postId: 11,
    sender: { avatar: null },
  },
  {
    id: 3,
    type: "FOLLOW_REQUEST",
    message: "Mia sent you a follow request.",
    createdAt: "2026-05-29T08:00:00.000Z",
    read: false,
    senderId: "user-4",
    sender: { avatar: null },
  },
];

function renderNotification() {
  return render(
    <Notification
      initialNotifications={notifications}
      userId="user-1"
    />
  );
}

describe("Notification component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    realtimeHandler = null;
    markNotificationAsRead.mockResolvedValue({ success: true });
    markAllNotificationsAsRead.mockResolvedValue({ success: true });
    deleteNotification.mockResolvedValue({ success: true });
    clearReadNotifications.mockResolvedValue({ success: true });
  });

  it("shows a single notification list without filters or preference checkboxes", () => {
    renderNotification();

    expect(screen.getByText("Dana liked your post.")).toBeInTheDocument();
    expect(screen.getByText("Alex commented on your post.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Unread/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Posts")).not.toBeInTheDocument();
  });

  it("marks and routes post notifications when clicked", async () => {
    renderNotification();

    fireEvent.click(screen.getByText("Dana liked your post."));

    await waitFor(() => {
      expect(markNotificationAsRead).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith("/post/10");
    });
  });

  it("prefetches initial and realtime notification routes", async () => {
    renderNotification();

    await waitFor(() => {
      expect(mockPrefetch).toHaveBeenCalledWith("/post/10");
      expect(mockPrefetch).toHaveBeenCalledWith("/post/11");
      expect(mockPrefetch).toHaveBeenCalledWith("/profile/user-4");
    });

    realtimeHandler({
      id: 4,
      type: "STORY_CREATED",
      message: "Dana posted a story.",
      createdAt: "2026-05-29T11:00:00.000Z",
      read: false,
      senderId: "user-2",
      storyId: 20,
      sender: { avatar: null },
    });

    expect(mockPrefetch).toHaveBeenCalledWith("/story/20");
  });

  it("routes follow notifications to the sender profile", async () => {
    renderNotification();

    fireEvent.click(screen.getByText("Mia sent you a follow request."));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/profile/user-4");
    });
  });

  it("supports mark all, delete one, and clear read", async () => {
    renderNotification();

    fireEvent.click(screen.getByTitle("Mark all as read"));
    fireEvent.click(screen.getAllByTitle("Delete notification")[0]);
    fireEvent.click(screen.getByTitle("Clear read notifications"));

    await waitFor(() => {
      expect(markAllNotificationsAsRead).toHaveBeenCalled();
      expect(deleteNotification).toHaveBeenCalledWith(1);
      expect(clearReadNotifications).toHaveBeenCalled();
    });
  });
});
