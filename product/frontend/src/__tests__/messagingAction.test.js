import {
  findOrCreateDirectConversation,
  getUnreadMessageCount,
  markConversationRead,
  sendAudioMessage,
  sendImageMessage,
  sendMessage,
} from "@/lib/messageAction";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { triggerMessageCreated } from "@/lib/pusherServer";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/pusherServer", () => ({
  triggerMessageCreated: jest.fn(),
  triggerMessageTyping: jest.fn(),
}));

jest.mock("@/lib/client", () => ({
  user: {
    findUnique: jest.fn(),
  },
  block: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  conversation: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  conversationParticipant: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  message: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe("messaging actions", () => {
  const currentUserId = "user-2";
  const otherUserId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ userId: currentUserId });
    prisma.user.findUnique.mockResolvedValue({ id: otherUserId });
    prisma.block.findFirst.mockResolvedValue(null);
  });

  it("creates direct conversations with a sorted unique key", async () => {
    const conversation = {
      id: 10,
      directKey: "user-1::user-2",
      updatedAt: new Date("2026-06-02T10:00:00.000Z"),
      participants: [
        {
          userId: currentUserId,
          user: { id: currentUserId, username: "me" },
        },
        {
          userId: otherUserId,
          user: { id: otherUserId, username: "friend" },
        },
      ],
    };
    prisma.conversation.upsert.mockResolvedValue(conversation);

    await expect(findOrCreateDirectConversation(otherUserId)).resolves.toEqual(
      expect.objectContaining({
        id: 10,
        participant: expect.objectContaining({ id: otherUserId }),
      })
    );

    expect(prisma.conversation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { directKey: "user-1::user-2" },
        create: expect.objectContaining({
          directKey: "user-1::user-2",
          participants: {
            create: [{ userId: currentUserId }, { userId: otherUserId }],
          },
        }),
      })
    );
  });

  it("rejects conversations when either user blocked the other", async () => {
    prisma.block.findFirst.mockResolvedValue({ id: 1 });

    await expect(findOrCreateDirectConversation(otherUserId)).rejects.toThrow(
      "Messaging is not available"
    );

    expect(prisma.conversation.upsert).not.toHaveBeenCalled();
  });

  it("sends a message and triggers realtime delivery to the other participant", async () => {
    const conversation = {
      id: 10,
      participants: [
        { userId: currentUserId, user: { id: currentUserId } },
        { userId: otherUserId, user: { id: otherUserId } },
      ],
    };
    const message = {
      id: 5,
      conversationId: 10,
      senderId: currentUserId,
      kind: "TEXT",
      body: "Hello Kuma",
      audioUrl: null,
      audioDurationMs: null,
      imageUrl: null,
      createdAt: new Date("2026-06-02T10:00:00.000Z"),
      sender: { id: currentUserId, username: "me" },
    };
    prisma.conversation.findFirst.mockResolvedValue(conversation);
    prisma.message.create.mockResolvedValue(message);
    prisma.conversation.update.mockResolvedValue({ id: 10 });

    await expect(sendMessage(10, " Hello Kuma ")).resolves.toEqual(
      expect.objectContaining({
        id: 5,
        body: "Hello Kuma",
      })
    );

    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          conversationId: 10,
          senderId: currentUserId,
          kind: "TEXT",
          body: "Hello Kuma",
        },
      })
    );
    expect(triggerMessageCreated).toHaveBeenCalledWith({
      receiverId: otherUserId,
      message,
    });
  });

  it("creates audio messages with Cloudinary metadata", async () => {
    const conversation = {
      id: 10,
      participants: [
        { userId: currentUserId, user: { id: currentUserId } },
        { userId: otherUserId, user: { id: otherUserId } },
      ],
    };
    const message = {
      id: 6,
      conversationId: 10,
      senderId: currentUserId,
      kind: "AUDIO",
      body: "",
      audioUrl: "https://res.cloudinary.com/kuma/video/upload/audio.webm",
      audioDurationMs: 1420,
      imageUrl: null,
      createdAt: new Date("2026-06-02T10:01:00.000Z"),
      sender: { id: currentUserId, username: "me" },
    };
    prisma.conversation.findFirst.mockResolvedValue(conversation);
    prisma.message.create.mockResolvedValue(message);
    prisma.conversation.update.mockResolvedValue({ id: 10 });

    await expect(
      sendAudioMessage(
        10,
        "https://res.cloudinary.com/kuma/video/upload/audio.webm",
        1420
      )
    ).resolves.toEqual(
      expect.objectContaining({
        kind: "AUDIO",
        audioUrl: "https://res.cloudinary.com/kuma/video/upload/audio.webm",
        audioDurationMs: 1420,
      })
    );

    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "AUDIO",
          body: "",
          audioUrl: "https://res.cloudinary.com/kuma/video/upload/audio.webm",
          audioDurationMs: 1420,
        }),
      })
    );
  });

  it("creates image messages with optional captions", async () => {
    const conversation = {
      id: 10,
      participants: [
        { userId: currentUserId, user: { id: currentUserId } },
        { userId: otherUserId, user: { id: otherUserId } },
      ],
    };
    const message = {
      id: 7,
      conversationId: 10,
      senderId: currentUserId,
      kind: "IMAGE",
      body: "Photo caption",
      audioUrl: null,
      audioDurationMs: null,
      imageUrl: "https://res.cloudinary.com/kuma/image/upload/photo.jpg",
      createdAt: new Date("2026-06-02T10:02:00.000Z"),
      sender: { id: currentUserId, username: "me" },
    };
    prisma.conversation.findFirst.mockResolvedValue(conversation);
    prisma.message.create.mockResolvedValue(message);
    prisma.conversation.update.mockResolvedValue({ id: 10 });

    await expect(
      sendImageMessage(
        10,
        "https://res.cloudinary.com/kuma/image/upload/photo.jpg",
        " Photo caption "
      )
    ).resolves.toEqual(
      expect.objectContaining({
        kind: "IMAGE",
        body: "Photo caption",
        imageUrl: "https://res.cloudinary.com/kuma/image/upload/photo.jpg",
      })
    );

    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "IMAGE",
          body: "Photo caption",
          imageUrl: "https://res.cloudinary.com/kuma/image/upload/photo.jpg",
        }),
      })
    );
  });

  it("rejects media messages from non-Cloudinary URLs", async () => {
    await expect(
      sendImageMessage(10, "https://example.com/photo.jpg")
    ).rejects.toThrow("Invalid image URL");

    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it("marks a conversation read for the authenticated participant", async () => {
    await expect(markConversationRead(10)).resolves.toEqual({ success: true });

    expect(prisma.conversationParticipant.updateMany).toHaveBeenCalledWith({
      where: {
        conversationId: 10,
        userId: currentUserId,
      },
      data: {
        lastReadAt: expect.any(Date),
      },
    });
  });

  it("returns zero unread messages when the database is unavailable", async () => {
    prisma.conversationParticipant.findMany.mockRejectedValue({
      code: "P1001",
      message: "Can't reach database server",
    });

    await expect(getUnreadMessageCount()).resolves.toBe(0);
  });
});
