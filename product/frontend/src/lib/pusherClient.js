"use client";

import Pusher from "pusher-js";

let pusherClient;
const channelSubscriptions = new Map();
const POST_EVENTS_CHANNEL = "public-posts";
const MESSAGE_PRESENCE_CHANNEL = "presence-messages";

export function getNotificationChannelName(userId) {
  return `private-user-${userId}`;
}

function getPresenceUserIds(channel) {
  const userIds = [];

  channel.members?.each((member) => {
    if (member?.id) {
      userIds.push(member.id);
    }
  });

  return userIds;
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

export function subscribeToMessagePresence(userId, onMembersChanged) {
  const pusher = getPusherClient();

  if (!pusher || !userId || !onMembersChanged) {
    return () => {};
  }

  let subscription = channelSubscriptions.get(MESSAGE_PRESENCE_CHANNEL);

  if (!subscription) {
    subscription = {
      channel: pusher.subscribe(MESSAGE_PRESENCE_CHANNEL),
      count: 0,
    };
    channelSubscriptions.set(MESSAGE_PRESENCE_CHANNEL, subscription);
  }

  subscription.count += 1;

  const handleMembersChanged = () => {
    onMembersChanged(getPresenceUserIds(subscription.channel));
  };

  subscription.channel.bind(
    "pusher:subscription_succeeded",
    handleMembersChanged
  );
  subscription.channel.bind("pusher:member_added", handleMembersChanged);
  subscription.channel.bind("pusher:member_removed", handleMembersChanged);
  handleMembersChanged();

  return () => {
    const currentSubscription = channelSubscriptions.get(MESSAGE_PRESENCE_CHANNEL);

    if (!currentSubscription) {
      return;
    }

    currentSubscription.channel.unbind(
      "pusher:subscription_succeeded",
      handleMembersChanged
    );
    currentSubscription.channel.unbind("pusher:member_added", handleMembersChanged);
    currentSubscription.channel.unbind(
      "pusher:member_removed",
      handleMembersChanged
    );
    currentSubscription.count -= 1;

    if (currentSubscription.count < 1) {
      pusher.unsubscribe(MESSAGE_PRESENCE_CHANNEL);
      channelSubscriptions.delete(MESSAGE_PRESENCE_CHANNEL);
    }
  };
}

export function subscribeToFriendEvents(userId, { onFriendRequestReceived }) {
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

  if (onFriendRequestReceived) {
    subscription.channel.bind("friend:request", onFriendRequestReceived);
  }

  return () => {
    const currentSubscription = channelSubscriptions.get(channelName);

    if (!currentSubscription) {
      return;
    }

    if (onFriendRequestReceived) {
      currentSubscription.channel.unbind("friend:request", onFriendRequestReceived);
    }

    currentSubscription.count -= 1;

    if (currentSubscription.count < 1) {
      pusher.unsubscribe(channelName);
      channelSubscriptions.delete(channelName);
    }
  };
}

export function subscribeToPostEvents({ onReactionUpdated, onCommentCreated }) {
  const pusher = getPusherClient();

  if (!pusher) {
    return () => {};
  }

  let subscription = channelSubscriptions.get(POST_EVENTS_CHANNEL);

  if (!subscription) {
    subscription = {
      channel: pusher.subscribe(POST_EVENTS_CHANNEL),
      count: 0,
    };
    channelSubscriptions.set(POST_EVENTS_CHANNEL, subscription);
  }

  subscription.count += 1;

  if (onReactionUpdated) {
    subscription.channel.bind("post:reaction", onReactionUpdated);
  }

  if (onCommentCreated) {
    subscription.channel.bind("post:comment", onCommentCreated);
  }

  return () => {
    const currentSubscription = channelSubscriptions.get(POST_EVENTS_CHANNEL);

    if (!currentSubscription) {
      return;
    }

    if (onReactionUpdated) {
      currentSubscription.channel.unbind("post:reaction", onReactionUpdated);
    }

    if (onCommentCreated) {
      currentSubscription.channel.unbind("post:comment", onCommentCreated);
    }

    currentSubscription.count -= 1;

    if (currentSubscription.count < 1) {
      pusher.unsubscribe(POST_EVENTS_CHANNEL);
      channelSubscriptions.delete(POST_EVENTS_CHANNEL);
    }
  };
}
