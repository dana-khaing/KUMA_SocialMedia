"use client";

import { useState } from "react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { markNotificationAsRead } from "@/lib/action";

const Notification = ({ initialNotifications, userId }) => {
  const [notifications, setNotifications] = useState(
    initialNotifications || []
  );
  const router = useRouter();

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id, userId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      router.refresh();
      if (notification.type === "USER_CREATED") {
        router.push(`/profile/${notification.senderId}`);
      }
      if (notification.type === "POST_LIKE") {
        router.push(`/post/${notification.post.id}`);
      }
      if (notification.type === "COMMENT_LIKE") {
        router.push(`/post/${notification.post.id}`);
      }
      if (notification.type === "COMMENT_REPLY") {
        router.push(`/post/${notification.post.id}`);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  return (
    <div className="w-full max-h-[80vh] bg-slate-50 rounded-2xl shadow-md text-sm pb-4 border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">Notifications</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      <div className="max-h-[70vh] overflow-y-auto scrollbar-hide flex flex-col gap-1 px-4">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-center hover:bg-slate-200 gap-2 p-4 rounded-xl cursor-pointer ${
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
};

export default Notification;
