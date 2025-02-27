import {
  followAction,
  blockAction,
  acceptFollowRequest,
  rejectFollowRequest,
} from "@/lib/action";
import { auth } from "@clerk/nextjs/server";
import prisma from "../lib/client";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

// Mock Prisma client
jest.mock("../lib/client", () => ({
  follower: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  followRequest: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  block: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Server Actions", () => {
  const userId = "user123";
  const currentUserId = "currentUser456";

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ userId: currentUserId });
  });

  // followAction Tests
  describe("followAction", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });
      await expect(followAction(userId)).rejects.toThrow(
        "User not authenticated"
      );
    });

    it("deletes existing follow relationship", async () => {
      prisma.follower.findFirst.mockResolvedValue({ id: "follow1" });
      await followAction(userId);

      expect(prisma.follower.findFirst).toHaveBeenCalledWith({
        where: { followerId: currentUserId, followingId: userId },
      });
      expect(prisma.follower.delete).toHaveBeenCalledWith({
        where: { id: "follow1" },
      });
      expect(prisma.followRequest.findFirst).not.toHaveBeenCalled();
    });

    it("deletes existing follow request if no follow exists", async () => {
      prisma.follower.findFirst.mockResolvedValue(null);
      prisma.followRequest.findFirst.mockResolvedValue({ id: "req1" });
      await followAction(userId);

      expect(prisma.followRequest.findFirst).toHaveBeenCalledWith({
        where: { senderId: currentUserId, receiverId: userId },
      });
      expect(prisma.followRequest.delete).toHaveBeenCalledWith({
        where: { id: "req1" },
      });
      expect(prisma.followRequest.create).not.toHaveBeenCalled();
    });

    it("creates follow request if no follow or request exists", async () => {
      prisma.follower.findFirst.mockResolvedValue(null);
      prisma.followRequest.findFirst.mockResolvedValue(null);
      await followAction(userId);

      expect(prisma.followRequest.create).toHaveBeenCalledWith({
        data: { senderId: currentUserId, receiverId: userId },
      });
    });

    it("throws error on database failure", async () => {
      prisma.follower.findFirst.mockRejectedValue(new Error("DB Error"));
      await expect(followAction(userId)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
    });
  });

  // blockAction Tests
  describe("blockAction", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });
      await expect(blockAction(userId)).rejects.toThrow(
        "User not authenticated"
      );
    });

    it("deletes existing block relationship", async () => {
      prisma.block.findFirst.mockResolvedValue({ id: "block1" });
      await blockAction(userId);

      expect(prisma.block.findFirst).toHaveBeenCalledWith({
        where: { blockerId: currentUserId, blockedId: userId },
      });
      expect(prisma.block.delete).toHaveBeenCalledWith({
        where: { id: "block1" },
      });
      expect(prisma.follower.findFirst).not.toHaveBeenCalled();
    });

    it("creates block, deletes follow and request if they exist", async () => {
      prisma.block.findFirst.mockResolvedValue(null);
      prisma.follower.findFirst.mockResolvedValue({ id: "follow1" });
      prisma.followRequest.findFirst.mockResolvedValue({ id: "req1" });

      await blockAction(userId);

      expect(prisma.follower.delete).toHaveBeenCalledWith({
        where: { id: "follow1" },
      });
      expect(prisma.followRequest.delete).toHaveBeenCalledWith({
        where: { id: "req1" },
      });
      expect(prisma.block.create).toHaveBeenCalledWith({
        data: { blockerId: currentUserId, blockedId: userId },
      });
    });

    it("creates block if no follow or request exists", async () => {
      prisma.block.findFirst.mockResolvedValue(null);
      prisma.follower.findFirst.mockResolvedValue(null);
      prisma.followRequest.findFirst.mockResolvedValue(null);

      await blockAction(userId);

      expect(prisma.block.create).toHaveBeenCalledWith({
        data: { blockerId: currentUserId, blockedId: userId },
      });
      expect(prisma.follower.delete).not.toHaveBeenCalled();
      expect(prisma.followRequest.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure", async () => {
      prisma.block.findFirst.mockRejectedValue(new Error("DB Error"));
      await expect(blockAction(userId)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
    });
  });
});
