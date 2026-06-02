import {
  clearReadNotifications,
  createNotification,
  deleteNotification,
  ensureBirthdayNotificationsForUser,
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

  it("creates birthday notifications for followed users in the next seven days", async () => {
    const upcomingBirthday = new Date();
    upcomingBirthday.setDate(upcomingBirthday.getDate() + 3);
    const dob = new Date(
      1990,
      upcomingBirthday.getMonth(),
      upcomingBirthday.getDate()
    );
    const notification = {
      id: 3,
      type: "BIRTHDAY_CELEBRATION",
      senderId,
      receiverId: userId,
    };

    prisma.follower.findMany.mockResolvedValue([
      {
        following: {
          id: senderId,
          username: "friend",
          name: "Birthday",
          surname: "Friend",
          dob,
        },
      },
    ]);
    prisma.notification.findFirst.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue(notification);

    await ensureBirthdayNotificationsForUser(userId);

    expect(prisma.follower.findMany).toHaveBeenCalledWith({
      where: {
        followerId: userId,
        following: {
          dob: {
            not: null,
          },
        },
      },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            dob: true,
          },
        },
      },
    });
    expect(prisma.notification.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        type: "BIRTHDAY_CELEBRATION",
        senderId,
        receiverId: userId,
        createdAt: { gte: expect.any(Date) },
      }),
    });
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "BIRTHDAY_CELEBRATION",
          senderId,
          receiverId: userId,
        }),
      })
    );
    expect(triggerNotificationCreated).toHaveBeenCalledWith(notification);
  });

  it("does not create birthday notifications for users who are not followed", async () => {
    prisma.follower.findMany.mockResolvedValue([]);

    await ensureBirthdayNotificationsForUser(userId);

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(triggerNotificationCreated).not.toHaveBeenCalled();
  });

  it("does not duplicate birthday notifications in the same birthday window", async () => {
    const birthday = new Date();
    const dob = new Date(1990, birthday.getMonth(), birthday.getDate());
    const existingNotification = {
      id: 4,
      type: "BIRTHDAY_CELEBRATION",
      senderId,
      receiverId: userId,
    };

    prisma.follower.findMany.mockResolvedValue([
      {
        following: {
          id: senderId,
          username: "friend",
          name: "Birthday",
          surname: "Friend",
          dob,
        },
      },
    ]);
    prisma.notification.findFirst.mockResolvedValue(existingNotification);

    await ensureBirthdayNotificationsForUser(userId);

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(triggerNotificationCreated).not.toHaveBeenCalled();
  });
});
