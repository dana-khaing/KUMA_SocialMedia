"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import Notification from "./notification";
import { ensureBirthdayNotificationsForUser } from "@/lib/action";
import BetaDatabaseFallback from "@/components/common/betaDatabaseFallback";
import { isDatabaseUnavailableError } from "@/lib/databaseStatus";

export const NotificationServer = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    await ensureBirthdayNotificationsForUser(userId);

    const notifications = await prisma.notification.findMany({
      where: { receiverId: userId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            avatar: true,
          },
        },
        post: { select: { id: true } },
        comment: { select: { id: true } },
        story: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return <Notification initialNotifications={notifications} userId={userId} />;
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return <BetaDatabaseFallback variant="compact" />;
    }

    throw error;
  }
};

export default NotificationServer;
