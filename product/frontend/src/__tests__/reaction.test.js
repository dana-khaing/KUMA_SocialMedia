import { switchLike, switchReaction } from "@/lib/action";
import { auth } from "@clerk/nextjs/server";
import prisma from "../lib/client";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

// Mock Prisma client
jest.mock("../lib/client", () => ({
  like: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  love: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
}));

describe("Server Actions", () => {
  const userId = "user123";
  const postId = 456;
  const currentUserId = "currentUser789";

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ userId: currentUserId });
  });

  // switchLike Tests
  describe("switchLike", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });
      await expect(switchLike(postId, null)).rejects.toThrow(
        "User not authenticated"
      );
    });

    it("removes existing like if it exists", async () => {
      const mockLike = { id: "like1", postId, userId: currentUserId };
      prisma.like.findFirst.mockResolvedValue(mockLike);
      prisma.like.delete.mockResolvedValue({});

      await switchLike(postId, currentUserId);

      expect(prisma.like.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: { id: "like1" },
      });
      expect(prisma.like.create).not.toHaveBeenCalled();
    });

    it("adds new like if no like exists", async () => {
      prisma.like.findFirst.mockResolvedValue(null);
      prisma.like.create.mockResolvedValue({});

      await switchLike(postId, currentUserId);

      expect(prisma.like.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { postId, userId: currentUserId },
      });
      expect(prisma.like.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during find", async () => {
      prisma.like.findFirst.mockRejectedValue(new Error("DB Error"));
      await expect(switchLike(postId, currentUserId)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
      expect(prisma.like.create).not.toHaveBeenCalled();
      expect(prisma.like.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during create", async () => {
      prisma.like.findFirst.mockResolvedValue(null);
      prisma.like.create.mockRejectedValue(new Error("DB Error"));

      await expect(switchLike(postId, currentUserId)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { postId, userId: currentUserId },
      });
      expect(prisma.like.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during delete", async () => {
      const mockLike = { id: "like1", postId, userId: currentUserId };
      prisma.like.findFirst.mockResolvedValue(mockLike);
      prisma.like.delete.mockRejectedValue(new Error("DB Error"));

      await expect(switchLike(postId, currentUserId)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: { id: "like1" },
      });
      expect(prisma.like.create).not.toHaveBeenCalled();
    });
  });

  // switchReaction Tests
  describe("switchReaction", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });
      await expect(switchReaction(postId, null, "like")).rejects.toThrow(
        "User not authenticated"
      );
    });

    it("toggles like on when no reactions exist", async () => {
      const mockTx = {
        like: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
          delete: jest.fn(),
        },
        love: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          delete: jest.fn(),
        },
      };
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await switchReaction(postId, currentUserId, "like");

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.like.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.love.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.like.create).toHaveBeenCalledWith({
        data: { postId, userId: currentUserId },
      });
      expect(mockTx.like.delete).not.toHaveBeenCalled();
      expect(mockTx.love.create).not.toHaveBeenCalled();
      expect(mockTx.love.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, reactionType: "like" });
    });

    it("toggles like off when like exists", async () => {
      const mockTx = {
        like: {
          findFirst: jest.fn().mockResolvedValue({ id: "like1" }),
          create: jest.fn(),
          delete: jest.fn().mockResolvedValue({}),
        },
        love: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          delete: jest.fn(),
        },
      };
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await switchReaction(postId, currentUserId, "like");

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.like.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.love.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.like.delete).toHaveBeenCalledWith({
        where: { id: "like1" },
      });
      expect(mockTx.like.create).not.toHaveBeenCalled();
      expect(mockTx.love.create).not.toHaveBeenCalled();
      expect(mockTx.love.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, reactionType: "like" });
    });

    it("switches from love to like", async () => {
      const mockTx = {
        like: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
          delete: jest.fn(),
        },
        love: {
          findFirst: jest.fn().mockResolvedValue({ id: "love1" }),
          create: jest.fn(),
          delete: jest.fn().mockResolvedValue({}),
        },
      };
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await switchReaction(postId, currentUserId, "like");

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.like.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.love.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.love.delete).toHaveBeenCalledWith({
        where: { id: "love1" },
      });
      expect(mockTx.like.create).toHaveBeenCalledWith({
        data: { postId, userId: currentUserId },
      });
      expect(mockTx.like.delete).not.toHaveBeenCalled();
      expect(mockTx.love.create).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, reactionType: "like" });
    });

    it("toggles love on when no reactions exist", async () => {
      const mockTx = {
        like: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          delete: jest.fn(),
        },
        love: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
          delete: jest.fn(),
        },
      };
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await switchReaction(postId, currentUserId, "love");

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.love.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.like.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.love.create).toHaveBeenCalledWith({
        data: { postId, userId: currentUserId },
      });
      expect(mockTx.love.delete).not.toHaveBeenCalled();
      expect(mockTx.like.create).not.toHaveBeenCalled();
      expect(mockTx.like.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, reactionType: "love" });
    });

    it("switches from like to love", async () => {
      const mockTx = {
        like: {
          findFirst: jest.fn().mockResolvedValue({ id: "like1" }),
          create: jest.fn(),
          delete: jest.fn().mockResolvedValue({}),
        },
        love: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
          delete: jest.fn(),
        },
      };
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await switchReaction(postId, currentUserId, "love");

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.love.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.like.findFirst).toHaveBeenCalledWith({
        where: { postId, userId: currentUserId },
      });
      expect(mockTx.like.delete).toHaveBeenCalledWith({
        where: { id: "like1" },
      });
      expect(mockTx.love.create).toHaveBeenCalledWith({
        data: { postId, userId: currentUserId },
      });
      expect(mockTx.love.delete).not.toHaveBeenCalled();
      expect(mockTx.like.create).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, reactionType: "love" });
    });

    it("throws error on database failure in transaction", async () => {
      const mockTx = {
        like: {
          findFirst: jest.fn().mockRejectedValue(new Error("DB Error")),
          create: jest.fn(),
          delete: jest.fn(),
        },
        love: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          delete: jest.fn(),
        },
      };
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      await expect(
        switchReaction(postId, currentUserId, "like")
      ).rejects.toThrow("Something went wrong, Kuma");
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
