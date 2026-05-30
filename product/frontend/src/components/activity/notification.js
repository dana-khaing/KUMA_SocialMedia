"use client";

import { useEffect, useMemo, useState } from "react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { CheckCheck, Trash2, X } from "lucide-react";
import {
  clearReadNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
} from "@/lib/action";
import { subscribeToNotificationEvents } from "@/lib/pusherClient";
import { NOTIFICATION_CHANGED_EVENT } from "@/components/navbar/notificationBadge";

const preferenceLabels = [
  ["posts", "Posts"],
  ["stories", "Stories"],
  ["comments", "Comments"],
  ["reactions", "Reactions"],
  ["follows", "Follows"],
  ["newUsers", "New users"],
];

const Notification = ({ initialNotifications, initialPreferences, userId }) => {
  const [notifications, setNotifications] = useState(
    initialNotifications || []
  );
  const [activeFilter, setActiveFilter] = useState("all");
  const [preferences, setPreferences] = useState(initialPreferences || {});
  const router = useRouter();

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((notification) => !notification.read);
    }

    return notifications;
  }, [activeFilter, notifications]);

  useEffect(() => {
    return subscribeToNotificationEvents(userId, (notification) => {
      setNotifications((currentNotifications) => {
        if (currentNotifications.some((item) => item.id === notification.id)) {
          return currentNotifications;
        }

        return [notification, ...currentNotifications].slice(0, 50);
      });
    });
  }, [userId]);

  const notifyNotificationStateChanged = () => {
    window.dispatchEvent(new Event(NOTIFICATION_CHANGED_EVENT));
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read in database
      await markNotificationAsRead(notification.id);
      // Update local state to reflect read status
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      notifyNotificationStateChanged();
      // Refresh any server-side data dependencies
      router.refresh();

      // Navigate to the correct page based on notification type
      switch (notification.type) {
        case "USER_CREATED":
          router.push(`/profile/${notification.senderId}`);
          break;
        case "POST_CREATED":
        case "LIKE":
        case "LOVE":
        case "COMMENT":
        case "COMMENT_LIKE":
        case "POST_COMMENTED":
        case "POST_LIKED":
        case "POST_LOVED":
        case "COMMENT_LIKED":
          if (notification.postId) {
            router.push(`/post/${notification.postId}`);
          }
          break;
        case "FOLLOW_REQUEST":
        case "FOLLOW_ACCEPTED":
          router.push(`/profile/${notification.senderId}`);
          break;
        case "STORY_CREATED":
          if (notification.storyId) {
            router.push(`/story/${notification.storyId}`);
          }
          break;
        default:
          // Unhandled notification types
          break;
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      notifyNotificationStateChanged();
      router.refresh();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (event, notificationId) => {
    event.stopPropagation();

    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      notifyNotificationStateChanged();
      router.refresh();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClearReadNotifications = async () => {
    try {
      await clearReadNotifications();
      setNotifications((prev) =>
        prev.filter((notification) => !notification.read)
      );
      notifyNotificationStateChanged();
      router.refresh();
    } catch (error) {
      console.error("Error clearing read notifications:", error);
    }
  };

  const handlePreferenceChange = async (key, enabled) => {
    const nextPreferences = {
      ...preferences,
      [key]: enabled,
    };

    setPreferences(nextPreferences);

    try {
      const result = await updateNotificationPreferences(nextPreferences);
      setPreferences(result.preferences);
      router.refresh();
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      setPreferences(preferences);
    }
  };

  return (
    <div className="w-full max-h-[80vh] bg-slate-50 rounded-2xl shadow-md text-sm pb-4 border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
      <div className="flex flex-col gap-3 px-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#FF4E01] font-semibold">Notifications</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={!unreadCount}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#FF4E01] shadow disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#FF4E01] hover:text-white"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleClearReadNotifications}
              disabled={notifications.length === unreadCount}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#FF4E01] shadow disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#FF4E01] hover:text-white"
              title="Clear read notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex rounded-full bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`h-8 flex-1 rounded-full text-xs font-medium ${
              activeFilter === "all"
                ? "bg-[#FF4E01] text-white"
                : "text-gray-600 hover:bg-slate-100"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("unread")}
            className={`h-8 flex-1 rounded-full text-xs font-medium ${
              activeFilter === "unread"
                ? "bg-[#FF4E01] text-white"
                : "text-gray-600 hover:bg-slate-100"
            }`}
          >
            Unread {unreadCount ? `(${unreadCount})` : ""}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {preferenceLabels.map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-gray-700 shadow-sm"
            >
              <input
                type="checkbox"
                checked={preferences[key] !== false}
                onChange={(event) =>
                  handlePreferenceChange(key, event.target.checked)
                }
                className="h-4 w-4 accent-[#FF4E01]"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      <div className="max-h-[70vh] overflow-y-auto scrollbar-hide flex flex-col gap-1 px-4">
        {visibleNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {activeFilter === "unread"
              ? "No unread notifications."
              : "No notifications yet."}
          </div>
        ) : (
          visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-center hover:bg-slate-200 gap-2 p-4 rounded-xl cursor-pointer ${
                notification.read ? "opacity-70" : ""
              }`}
            >
              <img
                src={notification.sender.avatar || "/user-default.png"}
                alt="profile"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full ring-1 ring-[#FF4E01] object-cover"
              />
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
              <button
                type="button"
                onClick={(event) =>
                  handleDeleteNotification(event, notification.id)
                }
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500"
                title="Delete notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;
