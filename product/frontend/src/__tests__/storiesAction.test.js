import { createStory, deleteStory } from "@/lib/action";
import prisma from "../lib/client";

// Mock Prisma client
jest.mock("../lib/client", () => ({
  story: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Server Actions", () => {
  const userId = "user123";
  const storyId = "story789";
  const imageUrl = "https://example.com/story.jpg";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // createStory Tests
  describe("createStory", () => {
    it("creates a story successfully with valid payload", async () => {
      const payload = { userId, imageUrl };
      const mockStory = {
        id: storyId,
        userId,
        image: imageUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: { id: userId, username: "testuser", avatar: "/avatar.png" },
      };
      prisma.story.create.mockResolvedValue(mockStory);

      const result = await createStory(payload);

      expect(prisma.story.create).toHaveBeenCalledWith({
        data: {
          userId,
          image: imageUrl,
          expiresAt: expect.any(Date),
        },
        include: { user: true },
      });
      expect(result).toEqual({ success: true, story: mockStory });
    });

    it("throws error if payload is invalid (not an object)", async () => {
      await expect(createStory(null)).rejects.toThrow(
        "Invalid payload: must be an object"
      );
      await expect(createStory("invalid")).rejects.toThrow(
        "Invalid payload: must be an object"
      );
      expect(prisma.story.create).not.toHaveBeenCalled();
    });

    it("throws error if user is not authenticated", async () => {
      const payload = { userId: null, imageUrl };

      await expect(createStory(payload)).rejects.toThrow(
        "User not authenticated"
      );
      expect(prisma.story.create).not.toHaveBeenCalled();
    });

    it("throws error if image is missing", async () => {
      const payload = { userId, imageUrl: "" };

      await expect(createStory(payload)).rejects.toThrow(
        "Story must contain an image"
      );
      expect(prisma.story.create).not.toHaveBeenCalled();
    });

    it("throws error on database failure", async () => {
      const payload = { userId, imageUrl };
      prisma.story.create.mockRejectedValue(new Error("DB Error"));

      await expect(createStory(payload)).rejects.toThrow(
        "Failed to create story"
      );
      expect(prisma.story.create).toHaveBeenCalledWith({
        data: {
          userId,
          image: imageUrl,
          expiresAt: expect.any(Date),
        },
        include: { user: true },
      });
    });
  });

  // deleteStory Tests
  describe("deleteStory", () => {
    it("deletes story successfully if user is story owner", async () => {
      const mockStory = {
        id: storyId,
        userId,
        image: imageUrl,
        user: { id: userId, username: "testuser" },
      };
      prisma.story.findUnique.mockResolvedValue(mockStory);
      prisma.story.delete.mockResolvedValue({});

      const result = await deleteStory(storyId, userId);

      expect(prisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: storyId },
        include: { user: true },
      });
      expect(prisma.story.delete).toHaveBeenCalledWith({
        where: { id: storyId },
      });
      expect(result).toEqual({ success: true });
    });

    it("returns success if story does not exist", async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      const result = await deleteStory(storyId, userId);

      expect(prisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: storyId },
        include: { user: true },
      });
      expect(prisma.story.delete).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: "Story already deleted or not found",
      });
    });

    it("throws error if user is not authenticated", async () => {
      await expect(deleteStory(storyId, null)).rejects.toThrow(
        "User not authenticated"
      );
      expect(prisma.story.findUnique).not.toHaveBeenCalled();
      expect(prisma.story.delete).not.toHaveBeenCalled();
    });

    it("throws error if user is not story owner", async () => {
      const mockStory = {
        id: storyId,
        userId: "otherUser",
        image: imageUrl,
        user: { id: "otherUser", username: "otheruser" },
      };
      prisma.story.findUnique.mockResolvedValue(mockStory);

      await expect(deleteStory(storyId, userId)).rejects.toThrow(
        "You can only delete your own stories"
      );
      expect(prisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: storyId },
        include: { user: true },
      });
      expect(prisma.story.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during find", async () => {
      prisma.story.findUnique.mockRejectedValue(new Error("DB Error"));

      await expect(deleteStory(storyId, userId)).rejects.toThrow(
        "Failed to delete story: DB Error"
      );
      expect(prisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: storyId },
        include: { user: true },
      });
      expect(prisma.story.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during delete", async () => {
      const mockStory = {
        id: storyId,
        userId,
        image: imageUrl,
        user: { id: userId, username: "testuser" },
      };
      prisma.story.findUnique.mockResolvedValue(mockStory);
      prisma.story.delete.mockRejectedValue(new Error("DB Delete Error"));

      await expect(deleteStory(storyId, userId)).rejects.toThrow(
        "Failed to delete story: DB Delete Error"
      );
      expect(prisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: storyId },
        include: { user: true },
      });
      expect(prisma.story.delete).toHaveBeenCalledWith({
        where: { id: storyId },
      });
    });
  });
});
