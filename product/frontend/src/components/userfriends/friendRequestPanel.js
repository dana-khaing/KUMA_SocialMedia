"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { subscribeToFriendEvents } from "@/lib/pusherClient";
import { FriendRequestList } from "./friendRequestList";

export const FriendRequestPanel = ({ initialRequests }) => {
  const { userId } = useAuth();
  const [requests, setRequests] = useState(initialRequests);

  useEffect(() => {
    if (!userId) return;

    const unsub = subscribeToFriendEvents(userId, {
      onFriendRequestReceived: (data) => {
        // Build a minimal request object matching what the server returns
        setRequests((prev) => {
          const alreadyExists = prev.some((r) => r.sender?.id === data.senderId);
          if (alreadyExists) return prev;
          return [
            ...prev,
            {
              id: Date.now(),
              senderId: data.senderId,
              receiverId: userId,
              createdAt: data.createdAt,
              sender: data.sender,
            },
          ];
        });
      },
    });

    return unsub;
  }, [userId]);

  return (
    <FriendRequestList
      request={requests}
      onRequestHandled={(id) =>
        setRequests((prev) => prev.filter((r) => r.id !== id))
      }
    />
  );
};

export default FriendRequestPanel;
