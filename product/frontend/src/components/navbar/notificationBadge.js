"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUnreadNotificationCount } from "@/lib/action";
import { subscribeToNotificationEvents } from "@/lib/pusherClient";

export const NOTIFICATION_CHANGED_EVENT = "kuma:notifications-changed";

export default function NotificationBadge({ className = "" }) {
  const { user } = useUser();
  const userId = user?.id;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    let active = true;

    const refreshCount = async () => {
      try {
        const unreadCount = await getUnreadNotificationCount();

        if (active) {
          setCount(unreadCount);
        }
      } catch (error) {
        console.error("Error refreshing notification count:", error);
      }
    };

    refreshCount();

    const unsubscribe = subscribeToNotificationEvents(userId, () => {
      setCount((currentCount) => currentCount + 1);
    });

    window.addEventListener(NOTIFICATION_CHANGED_EVENT, refreshCount);

    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener(NOTIFICATION_CHANGED_EVENT, refreshCount);
    };
  }, [userId]);

  if (!count) {
    return null;
  }

  return (
    <span
      className={`min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[0.7rem] leading-5 text-center font-semibold ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
