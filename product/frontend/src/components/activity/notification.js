"use server";

import { Separator } from "@radix-ui/react-dropdown-menu";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { formatDistanceToNow } from "date-fns";

export const Notification = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }

    // Fetch notifications where the user is the receiver
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
        post: {
          select: {
            id: true,
          },
        },
        comment: {
          select: {
            id: true,
          },
        },
        story: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to prevent excessive data
    });

    return (
      <div className="w-full h-[120vh] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
        <div className="flex items-center justify-between px-4">
          <span className="text-[#FF4E01]">Notifications</span>
        </div>
        <Separator
          orientation="horizontal"
          className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
        />
        {/* Notification container */}
        <div className="h-[110vh] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-4">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center hover:bg-slate-200 gap-2 p-4 rounded-xl ${
                  notification.read ? "opacity-70" : ""
                }`}
              >
                <div className="flex-shrink-0 rounded-full bg-white items-center justify-center mr-2">
                  <img
                    src={notification.sender.avatar || "/user-default.png"}
                    alt="profile"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full ring-1 ring-[#FF4E01] object-cover"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-md line-clamp-2">
                    {notification.message}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return (
      <div className="w-full h-[120vh] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
        <div className="flex items-center justify-between px-4">
          <span className="text-[#FF4E01]">Notifications</span>
        </div>
        <Separator
          orientation="horizontal"
          className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
        />
        <div className="p-4 text-center text-red-500">
          Failed to load notifications.
        </div>
      </div>
    );
  }
};

export default Notification;
