"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import {
  triggerMessageCreated,
  triggerMessageTyping,
} from "@/lib/pusherServer";

const MESSAGE_LIMIT = 50;

function getDirectKey(userIdA, userIdB) {
  return [userIdA, userIdB].sort().join("::");
}

function serializeUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    surname: user.surname,
    avatar: user.avatar,
  };
}

function serializeMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    body: message.body,
    createdAt:
      message.createdAt instanceof Date
        ? message.createdAt.toISOString()
        : message.createdAt,
    sender: message.sender ? serializeUser(message.sender) : null,
  };
}

async function getAuthenticatedUserId() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return userId;
}

async function getBlockedUserIds(userId) {
  const blocks = await prisma.block.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: {
      blockerId: true,
      blockedId: true,
    },
  });

  return blocks.map((block) =>
    block.blockerId === userId ? block.blockedId : block.blockerId
  );
}

async function ensureCanMessage(senderId, receiverId) {
  if (!receiverId || senderId === receiverId) {
    throw new Error("Invalid message recipient");
  }

  const [receiver, block] = await Promise.all([
    prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    }),
    prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: senderId, blockedId: receiverId },
          { blockerId: receiverId, blockedId: senderId },
        ],
      },
      select: { id: true },
    }),
  ]);

  if (!receiver) {
    throw new Error("Recipient not found");
  }

  if (block) {
    throw new Error("Messaging is not available for this user");
  }
}

async function requireConversationParticipant(conversationId, userId) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              surname: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
}

function getOtherParticipant(conversation, userId) {
  return conversation.participants.find(
    (participant) => participant.userId !== userId
  );
}

async function getConversationUnreadCount(conversationId, userId, lastReadAt) {
  return prisma.message.count({
    where: {
      conversationId,
      senderId: { not: userId },
      ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
    },
  });
}

export async function listMessageConversations() {
  const userId = await getAuthenticatedUserId();

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  surname: true,
                  avatar: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  surname: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      conversation: {
        updatedAt: "desc",
      },
    },
  });

  const conversations = await Promise.all(
    participants.map(async (participant) => {
      const otherParticipant = getOtherParticipant(
        participant.conversation,
        userId
      );
      const latestMessage = participant.conversation.messages[0] || null;
      const unreadCount = await getConversationUnreadCount(
        participant.conversationId,
        userId,
        participant.lastReadAt
      );

      return {
        id: participant.conversationId,
        updatedAt: participant.conversation.updatedAt.toISOString(),
        participant: otherParticipant ? serializeUser(otherParticipant.user) : null,
        latestMessage: latestMessage ? serializeMessage(latestMessage) : null,
        unreadCount,
      };
    })
  );

  return conversations;
}

export async function getUnreadMessageCount() {
  const conversations = await listMessageConversations();

  return conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );
}

export async function searchMessageUsers(query) {
  const userId = await getAuthenticatedUserId();
  const trimmedQuery = String(query || "").trim();

  if (!trimmedQuery) {
    return [];
  }

  const blockedUserIds = await getBlockedUserIds(userId);

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: userId,
        notIn: blockedUserIds,
      },
      OR: [
        { name: { contains: trimmedQuery } },
        { surname: { contains: trimmedQuery } },
        { username: { contains: trimmedQuery } },
      ],
    },
    select: {
      id: true,
      username: true,
      name: true,
      surname: true,
      avatar: true,
    },
    take: 10,
  });

  return users.map(serializeUser);
}

export async function findOrCreateDirectConversation(otherUserId) {
  const userId = await getAuthenticatedUserId();

  await ensureCanMessage(userId, otherUserId);

  const directKey = getDirectKey(userId, otherUserId);

  const conversation = await prisma.conversation.upsert({
    where: { directKey },
    update: {},
    create: {
      directKey,
      participants: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              surname: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  const otherParticipant = getOtherParticipant(conversation, userId);

  return {
    id: conversation.id,
    updatedAt: conversation.updatedAt.toISOString(),
    participant: otherParticipant ? serializeUser(otherParticipant.user) : null,
    latestMessage: null,
    unreadCount: 0,
  };
}

export async function getConversationMessages(conversationId) {
  const userId = await getAuthenticatedUserId();
  const parsedConversationId = Number(conversationId);

  if (!Number.isInteger(parsedConversationId)) {
    throw new Error("Invalid conversation id");
  }

  await requireConversationParticipant(parsedConversationId, userId);

  const messages = await prisma.message.findMany({
    where: { conversationId: parsedConversationId },
    orderBy: { createdAt: "asc" },
    take: MESSAGE_LIMIT,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          avatar: true,
        },
      },
    },
  });

  return messages.map(serializeMessage);
}

export async function sendMessage(conversationId, body) {
  const userId = await getAuthenticatedUserId();
  const parsedConversationId = Number(conversationId);
  const trimmedBody = String(body || "").trim();

  if (!Number.isInteger(parsedConversationId)) {
    throw new Error("Invalid conversation id");
  }

  if (!trimmedBody || trimmedBody.length > 2000) {
    throw new Error("Message must be between 1 and 2000 characters");
  }

  const conversation = await requireConversationParticipant(
    parsedConversationId,
    userId
  );
  const otherParticipant = getOtherParticipant(conversation, userId);

  if (!otherParticipant) {
    throw new Error("Conversation recipient not found");
  }

  await ensureCanMessage(userId, otherParticipant.userId);

  const message = await prisma.message.create({
    data: {
      conversationId: parsedConversationId,
      senderId: userId,
      body: trimmedBody,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          avatar: true,
        },
      },
    },
  });

  await prisma.conversation.update({
    where: { id: parsedConversationId },
    data: { updatedAt: new Date() },
  });

  await triggerMessageCreated({
    receiverId: otherParticipant.userId,
    message,
  });

  return serializeMessage(message);
}

export async function markConversationRead(conversationId) {
  const userId = await getAuthenticatedUserId();
  const parsedConversationId = Number(conversationId);

  if (!Number.isInteger(parsedConversationId)) {
    throw new Error("Invalid conversation id");
  }

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: parsedConversationId,
      userId,
    },
    data: {
      lastReadAt: new Date(),
    },
  });

  return { success: true };
}

export async function sendTypingEvent(conversationId) {
  const userId = await getAuthenticatedUserId();
  const parsedConversationId = Number(conversationId);

  if (!Number.isInteger(parsedConversationId)) {
    throw new Error("Invalid conversation id");
  }

  const conversation = await requireConversationParticipant(
    parsedConversationId,
    userId
  );
  const otherParticipant = getOtherParticipant(conversation, userId);

  if (!otherParticipant) {
    return { success: true };
  }

  await triggerMessageTyping({
    receiverId: otherParticipant.userId,
    conversationId: parsedConversationId,
    userId,
  });

  return { success: true };
}
