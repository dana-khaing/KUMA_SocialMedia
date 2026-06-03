import Pusher from "pusher";

let pusherServer;
const POST_EVENTS_CHANNEL = "public-posts";
const MESSAGE_PRESENCE_CHANNEL = "presence-messages";

export function getNotificationChannelName(userId) {
  return `private-user-${userId}`;
}

export function getMessagePresenceChannelName() {
  return MESSAGE_PRESENCE_CHANNEL;
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

function serializeUser(user) {
  return user
    ? {
        id: user.id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        avatar: user.avatar,
      }
    : null;
}

function serializeMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    kind: message.kind || "TEXT",
    body: message.body,
    audioUrl: message.audioUrl || null,
    audioDurationMs: message.audioDurationMs || null,
    imageUrl: message.imageUrl || null,
    createdAt:
      message.createdAt instanceof Date
        ? message.createdAt.toISOString()
        : message.createdAt,
    sender: serializeUser(message.sender),
  };
}

function serializeComment(comment) {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    desc: comment.desc,
    createdAt:
      comment.createdAt instanceof Date
        ? comment.createdAt.toISOString()
        : comment.createdAt,
    user: serializeUser(comment.user),
    likes: Array.isArray(comment.likes) ? comment.likes : [],
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

export async function triggerMessageCreated({ receiverId, message }) {
  const pusher = getPusherServer();

  if (!pusher || !receiverId || !message) {
    return;
  }

  try {
    await pusher.trigger(
      getNotificationChannelName(receiverId),
      "message:new",
      serializeMessage(message)
    );
  } catch (error) {
    console.error("Error triggering realtime message:", error);
  }
}

export async function triggerMessageTyping({ receiverId, conversationId, userId }) {
  const pusher = getPusherServer();

  if (!pusher || !receiverId || !conversationId || !userId) {
    return;
  }

  try {
    await pusher.trigger(getNotificationChannelName(receiverId), "message:typing", {
      conversationId,
      userId,
    });
  } catch (error) {
    console.error("Error triggering typing event:", error);
  }
}

export async function triggerPostReactionUpdated(payload) {
  const pusher = getPusherServer();

  if (!pusher || !payload?.postId) {
    return;
  }

  try {
    await pusher.trigger(POST_EVENTS_CHANNEL, "post:reaction", payload);
  } catch (error) {
    console.error("Error triggering realtime post reaction:", error);
  }
}

export async function triggerPostCommentCreated({ comment, commentCount }) {
  const pusher = getPusherServer();

  if (!pusher || !comment?.postId) {
    return;
  }

  try {
    await pusher.trigger(POST_EVENTS_CHANNEL, "post:comment", {
      postId: comment.postId,
      comment: serializeComment(comment),
      commentCount,
    });
  } catch (error) {
    console.error("Error triggering realtime post comment:", error);
  }
}

export async function triggerFriendRequestSent({ senderId, receiverId, sender }) {
  const pusher = getPusherServer();

  if (!pusher || !receiverId || !senderId) {
    return;
  }

  try {
    await pusher.trigger(
      getNotificationChannelName(receiverId),
      "friend:request",
      {
        senderId,
        sender: serializeUser(sender),
        createdAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Error triggering friend request event:", error);
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

export function authorizePusherChannel({ socketId, channelName, userId }) {
  const pusher = getPusherServer();

  if (!pusher) {
    return null;
  }

  if (channelName === getNotificationChannelName(userId)) {
    return pusher.authorizeChannel(socketId, channelName);
  }

  if (channelName === MESSAGE_PRESENCE_CHANNEL) {
    return pusher.authorizeChannel(socketId, channelName, {
      user_id: userId,
    });
  }

  return null;
}
