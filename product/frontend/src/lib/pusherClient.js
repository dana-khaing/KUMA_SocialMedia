"use client";

import Pusher from "pusher-js";

let pusherClient;
const channelSubscriptions = new Map();

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
  let subscription = channelSubscriptions.get(channelName);

  if (!subscription) {
    subscription = {
      channel: pusher.subscribe(channelName),
      count: 0,
    };
    channelSubscriptions.set(channelName, subscription);
  }

  subscription.count += 1;

  subscription.channel.bind("notification:new", onNotificationCreated);

  return () => {
    const currentSubscription = channelSubscriptions.get(channelName);

    if (!currentSubscription) {
      return;
    }

    currentSubscription.channel.unbind(
      "notification:new",
      onNotificationCreated
    );
    currentSubscription.count -= 1;

    if (currentSubscription.count < 1) {
      pusher.unsubscribe(channelName);
      channelSubscriptions.delete(channelName);
    }
  };
}

export function subscribeToMessageEvents(userId, { onMessageCreated, onTyping }) {
  const pusher = getPusherClient();

  if (!pusher || !userId) {
    return () => {};
  }

  const channelName = getNotificationChannelName(userId);
  let subscription = channelSubscriptions.get(channelName);

  if (!subscription) {
    subscription = {
      channel: pusher.subscribe(channelName),
      count: 0,
    };
    channelSubscriptions.set(channelName, subscription);
  }

  subscription.count += 1;

  if (onMessageCreated) {
    subscription.channel.bind("message:new", onMessageCreated);
  }

  if (onTyping) {
    subscription.channel.bind("message:typing", onTyping);
  }

  return () => {
    const currentSubscription = channelSubscriptions.get(channelName);

    if (!currentSubscription) {
      return;
    }

    if (onMessageCreated) {
      currentSubscription.channel.unbind("message:new", onMessageCreated);
    }

    if (onTyping) {
      currentSubscription.channel.unbind("message:typing", onTyping);
    }

    currentSubscription.count -= 1;

    if (currentSubscription.count < 1) {
      pusher.unsubscribe(channelName);
      channelSubscriptions.delete(channelName);
    }
  };
}
