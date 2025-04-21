"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import Notification from "./notification";

export const NotificationServer = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  try {
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

    return (
      <Notification initialNotifications={notifications} userId={userId} />
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return (
      <div className="w-full max-h-[80vh] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
        <div className="p-4 text-center text-red-500">
          Failed to load notifications.
        </div>
      </div>
    );
  }
};

export default NotificationServer;
