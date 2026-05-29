"use client";

import Pusher from "pusher-js";

let pusherClient;

export function getNotificationChannelName(userId) {
  return `private-user-${userId}`;
}

export function getPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    return null;
  }

  if (!pusherClient) {
    pusherClient = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
    });
  }

  return pusherClient;
}

export function subscribeToNotificationEvents(userId, onNotificationCreated) {
  const pusher = getPusherClient();

  if (!pusher || !userId) {
    return () => {};
  }

  const channelName = getNotificationChannelName(userId);
  const channel = pusher.subscribe(channelName);

  channel.bind("notification:new", onNotificationCreated);

  return () => {
    channel.unbind("notification:new", onNotificationCreated);
    pusher.unsubscribe(channelName);
  };
}
