import Pusher from "pusher";

let pusherServer;

export function getNotificationChannelName(userId) {
  return `private-user-${userId}`;
}

function getPusherServer() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster =
    process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  if (!pusherServer) {
    pusherServer = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  return pusherServer;
}

function serializeNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    createdAt:
      notification.createdAt instanceof Date
        ? notification.createdAt.toISOString()
        : notification.createdAt,
    read: notification.read,
    senderId: notification.senderId,
    receiverId: notification.receiverId,
    postId: notification.postId,
    commentId: notification.commentId,
    storyId: notification.storyId,
    sender: notification.sender
      ? {
          id: notification.sender.id,
          name: notification.sender.name,
          surname: notification.sender.surname,
          username: notification.sender.username,
          avatar: notification.sender.avatar,
        }
      : null,
  };
}

export async function triggerNotificationCreated(notification) {
  const pusher = getPusherServer();

  if (!pusher || !notification?.receiverId) {
    return;
  }

  try {
    await pusher.trigger(
      getNotificationChannelName(notification.receiverId),
      "notification:new",
      serializeNotification(notification)
    );
  } catch (error) {
    console.error("Error triggering realtime notification:", error);
  }
}

export function authorizeNotificationChannel({ socketId, channelName, userId }) {
  const pusher = getPusherServer();
  const expectedChannelName = getNotificationChannelName(userId);

  if (!pusher || channelName !== expectedChannelName) {
    return null;
  }

  return pusher.authorizeChannel(socketId, channelName);
}
