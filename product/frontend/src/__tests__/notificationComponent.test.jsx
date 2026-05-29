/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Notification from "@/components/activity/notification";
import {
  clearReadNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
} from "@/lib/action";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

jest.mock("@/lib/pusherClient", () => ({
  subscribeToNotificationEvents: jest.fn(() => jest.fn()),
}));

jest.mock("@/components/navbar/notificationBadge", () => ({
  NOTIFICATION_CHANGED_EVENT: "kuma:notifications-changed",
}));

jest.mock("@/lib/action", () => ({
  clearReadNotifications: jest.fn(),
  deleteNotification: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  markNotificationAsRead: jest.fn(),
  updateNotificationPreferences: jest.fn(),
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
      initialPreferences={{
        posts: true,
        stories: true,
        comments: true,
        reactions: true,
        follows: true,
        newUsers: true,
      }}
      userId="user-1"
    />
  );
}

describe("Notification component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markNotificationAsRead.mockResolvedValue({ success: true });
    markAllNotificationsAsRead.mockResolvedValue({ success: true });
    deleteNotification.mockResolvedValue({ success: true });
    clearReadNotifications.mockResolvedValue({ success: true });
    updateNotificationPreferences.mockResolvedValue({
      preferences: {
        posts: false,
        stories: true,
        comments: true,
        reactions: true,
        follows: true,
        newUsers: true,
      },
    });
  });

  it("filters unread notifications without losing all notifications", () => {
    renderNotification();

    fireEvent.click(screen.getByRole("button", { name: /Unread/i }));

    expect(screen.getByText("Dana liked your post.")).toBeInTheDocument();
    expect(
      screen.queryByText("Alex commented on your post.")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All" }));

    expect(screen.getByText("Alex commented on your post.")).toBeInTheDocument();
  });

  it("marks and routes post notifications when clicked", async () => {
    renderNotification();

    fireEvent.click(screen.getByText("Dana liked your post."));

    await waitFor(() => {
      expect(markNotificationAsRead).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith("/post/10");
    });
  });

  it("routes follow notifications to the sender profile", async () => {
    renderNotification();

    fireEvent.click(screen.getByText("Mia sent you a follow request."));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/profile/user-4");
    });
  });

  it("supports mark all, delete one, clear read, and preferences", async () => {
    renderNotification();

    fireEvent.click(screen.getByTitle("Mark all as read"));
    fireEvent.click(screen.getAllByTitle("Delete notification")[0]);
    fireEvent.click(screen.getByTitle("Clear read notifications"));
    fireEvent.click(screen.getByLabelText("Posts"));

    await waitFor(() => {
      expect(markAllNotificationsAsRead).toHaveBeenCalled();
      expect(deleteNotification).toHaveBeenCalledWith(1);
      expect(clearReadNotifications).toHaveBeenCalled();
      expect(updateNotificationPreferences).toHaveBeenCalledWith(
        expect.objectContaining({ posts: false })
      );
    });
  });
});
