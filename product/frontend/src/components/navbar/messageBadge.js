"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUnreadMessageCount } from "@/lib/messageAction";
import { subscribeToMessageEvents } from "@/lib/pusherClient";

export const MESSAGE_CHANGED_EVENT = "kuma:messages-changed";

export default function MessageBadge({ className = "" }) {
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
        const unreadCount = await getUnreadMessageCount();

        if (active) {
          setCount(unreadCount);
        }
      } catch (error) {
        console.error("Error refreshing message count:", error);
      }
    };

    refreshCount();

    const unsubscribe = subscribeToMessageEvents(userId, {
      onMessageCreated: () => {
        setCount((currentCount) => currentCount + 1);
      },
    });

    window.addEventListener(MESSAGE_CHANGED_EVENT, refreshCount);

    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener(MESSAGE_CHANGED_EVENT, refreshCount);
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
