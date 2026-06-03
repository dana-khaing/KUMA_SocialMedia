import {
  clearReadNotifications,
  createNotification,
  deleteNotification,
  generateBirthdayNotificationsForUser,
  getNotificationPreferences,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
} from "@/lib/action";
import { auth } from "@clerk/nextjs/server";
import prisma from "../lib/client";
import { triggerNotificationCreated } from "../lib/pusherServer";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

jest.mock("../lib/pusherServer", () => ({
  triggerNotificationCreated: jest.fn(),
}));

jest.mock("../lib/client", () => ({
  notification: {
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  notificationPreference: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  follower: {
    findMany: jest.fn(),
  },
}));

describe("notification actions", () => {
  const userId = "user-1";
  const senderId = "user-2";

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ userId });
    prisma.notificationPreference.findUnique.mockResolvedValue(null);
    prisma.follower.findMany.mockResolvedValue([]);
  });

  it("counts unread notifications for the authenticated receiver", async () => {
    prisma.notification.count.mockResolvedValue(3);

    await expect(getUnreadNotificationCount()).resolves.toBe(3);

    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { receiverId: userId, read: false },
    });
  });

  it("marks one notification as read for the authenticated receiver only", async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });

    await expect(markNotificationAsRead(12)).resolves.toEqual({
      success: true,
      count: 1,
    });

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 12, receiverId: userId },
      data: { read: true },
    });
  });

  it("marks all unread notifications as read for the authenticated receiver", async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 2 });

    await expect(markAllNotificationsAsRead()).resolves.toEqual({
      success: true,
      count: 2,
    });

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { receiverId: userId, read: false },
      data: { read: true },
    });
  });

  it("deletes one notification for the authenticated receiver only", async () => {
    prisma.notification.deleteMany.mockResolvedValue({ count: 1 });

    await expect(deleteNotification(9)).resolves.toEqual({
      success: true,
      count: 1,
    });

    expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
      where: { id: 9, receiverId: userId },
    });
  });

  it("clears only read notifications for the authenticated receiver", async () => {
    prisma.notification.deleteMany.mockResolvedValue({ count: 4 });

    await expect(clearReadNotifications()).resolves.toEqual({
      success: true,
      count: 4,
    });

    expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
      where: { receiverId: userId, read: true },
    });
  });

  it("returns enabled defaults when preferences do not exist yet", async () => {
    await expect(getNotificationPreferences()).resolves.toEqual({
      userId,
      posts: true,
      stories: true,
      comments: true,
      reactions: true,
      follows: true,
      newUsers: true,
    });
  });

  it("updates preferences with normalized boolean fields only", async () => {
    prisma.notificationPreference.upsert.mockResolvedValue({
      userId,
      posts: false,
      stories: true,
      comments: true,
      reactions: false,
      follows: true,
      newUsers: true,
    });

    await expect(
      updateNotificationPreferences({
        posts: false,
        reactions: false,
        ignored: false,
      })
    ).resolves.toEqual({
      success: true,
      preferences: {
        userId,
        posts: false,
        stories: true,
        comments: true,
        reactions: false,
        follows: true,
        newUsers: true,
      },
    });

    expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith({
      where: { userId },
      create: {
        userId,
        posts: false,
        stories: true,
        comments: true,
        reactions: false,
        follows: true,
        newUsers: true,
      },
      update: {
        posts: false,
        stories: true,
        comments: true,
        reactions: false,
        follows: true,
        newUsers: true,
      },
    });
  });

  it("creates a notification and triggers realtime delivery", async () => {
    const notification = {
      id: 1,
      type: "FOLLOW_REQUEST",
      message: "Sent you a follow request.",
      senderId,
      receiverId: userId,
      read: false,
    };
    prisma.notification.findFirst.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue(notification);

    await expect(
      createNotification({
        type: "FOLLOW_REQUEST",
        message: "Sent you a follow request.",
        senderId,
        receiverId: userId,
      })
    ).resolves.toBe(notification);

    expect(triggerNotificationCreated).toHaveBeenCalledWith(notification);
  });

  it("does not create self-notifications", async () => {
    await expect(
      createNotification({
        type: "FOLLOW_REQUEST",
        message: "Self action.",
        senderId: userId,
        receiverId: userId,
      })
    ).resolves.toBeNull();

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(triggerNotificationCreated).not.toHaveBeenCalled();
  });

  it("skips notifications disabled by receiver preferences", async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue({
      userId,
      follows: false,
    });

    await expect(
      createNotification({
        type: "FOLLOW_REQUEST",
        message: "Sent you a follow request.",
        senderId,
        receiverId: userId,
      })
    ).resolves.toBeNull();

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(triggerNotificationCreated).not.toHaveBeenCalled();
  });

  it("returns duplicate notification without retriggering realtime delivery", async () => {
    const existingNotification = { id: 2, type: "POST_LIKED" };
    prisma.notification.findFirst.mockResolvedValue(existingNotification);

    await expect(
      createNotification({
        type: "POST_LIKED",
        message: "Liked your post.",
        senderId,
        receiverId: userId,
        postId: 10,
      })
    ).resolves.toBe(existingNotification);

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(triggerNotificationCreated).not.toHaveBeenCalled();
  });

  it("creates birthday notifications for followed users today and upcoming 7 days", async () => {
    prisma.follower.findMany.mockResolvedValue([
      {
        following: {
          id: senderId,
          username: "dana",
          name: "Dana",
          surname: "K",
          avatar: null,
          dob: new Date("1999-06-02T00:00:00.000Z"),
        },
      },
      {
        following: {
          id: "user-3",
          username: "alex",
          dob: new Date("2000-06-20T00:00:00.000Z"),
        },
      },
    ]);
    prisma.notification.findFirst.mockResolvedValue(null);
    prisma.notification.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: data.senderId === senderId ? 10 : 11,
        ...data,
        read: false,
      })
    );

    await expect(
      generateBirthdayNotificationsForUser(
        userId,
        new Date("2026-06-02T12:00:00.000Z")
      )
    ).resolves.toHaveLength(1);

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "BIRTHDAY",
          senderId,
          receiverId: userId,
          message: "Dana K has a birthday today.",
        }),
      })
    );
    expect(triggerNotificationCreated).toHaveBeenCalled();
  });

  it("does not duplicate birthday notifications inside the same window", async () => {
    prisma.follower.findMany.mockResolvedValue([
      {
        following: {
          id: senderId,
          username: "dana",
          dob: new Date("2000-06-02T00:00:00.000Z"),
        },
      },
    ]);
    prisma.notification.findFirst.mockResolvedValue({ id: 99 });

    await expect(
      generateBirthdayNotificationsForUser(
        userId,
        new Date("2026-06-02T10:00:00.000Z")
      )
    ).resolves.toEqual([]);

    expect(prisma.notification.create).not.toHaveBeenCalled();
  });
});
