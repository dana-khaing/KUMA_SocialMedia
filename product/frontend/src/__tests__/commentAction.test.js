import {
  loadComments,
  createComment,
  switchCommentLike,
  deleteComment,
} from "@/lib/action";
import { auth } from "@clerk/nextjs/server";
import prisma from "../lib/client";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

// Mock Prisma client
jest.mock("../lib/client", () => ({
  comment: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  like: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Server Actions", () => {
  const userId = "user123";
  const postId = 456;
  const commentId = "comment789";
  const commentDesc = "This is a test comment";

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ userId });
  });

  // loadComments Tests
  describe("loadComments", () => {
    it("loads comments for a post successfully", async () => {
      const mockComments = [
        {
          id: commentId,
          postId,
          userId,
          desc: commentDesc,
          user: { id: userId, username: "testuser", avatar: "/avatar.png" },
          likes: [],
        },
      ];
      prisma.comment.findMany.mockResolvedValue(mockComments);

      const result = await loadComments(postId);

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
        include: { user: true, likes: true },
      });
      expect(result).toEqual(mockComments);
    });

    it("returns empty array when no comments exist", async () => {
      prisma.comment.findMany.mockResolvedValue([]);

      const result = await loadComments(postId);

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
        include: { user: true, likes: true },
      });
      expect(result).toEqual([]);
    });

    it("throws error on database failure", async () => {
      prisma.comment.findMany.mockRejectedValue(new Error("DB Error"));

      await expect(loadComments(postId)).rejects.toThrow(
        "Failed to load comments. Kuma"
      );
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
        include: { user: true, likes: true },
      });
    });
  });

  // createComment Tests
  describe("createComment", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });

      await expect(createComment(postId, null, commentDesc)).rejects.toThrow(
        "User not authenticated"
      );
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it("creates a comment successfully", async () => {
      const mockComment = {
        id: commentId,
        postId,
        userId,
        desc: commentDesc,
        user: { id: userId, username: "testuser", avatar: "/avatar.png" },
        likes: [],
      };
      prisma.comment.create.mockResolvedValue(mockComment);

      const result = await createComment(postId, userId, commentDesc);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: { postId, userId, desc: commentDesc },
        include: { user: true, likes: true },
      });
      expect(result).toEqual({ success: true, comment: mockComment });
    });

    it("throws error on database failure", async () => {
      prisma.comment.create.mockRejectedValue(new Error("DB Error"));

      await expect(createComment(postId, userId, commentDesc)).rejects.toThrow(
        "Failed to create comment"
      );
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: { postId, userId, desc: commentDesc },
        include: { user: true, likes: true },
      });
    });
  });

  // switchCommentLike Tests
  describe("switchCommentLike", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });

      await expect(switchCommentLike(commentId, null)).rejects.toThrow(
        "User not authenticated"
      );
      expect(prisma.like.findFirst).not.toHaveBeenCalled();
    });

    it("removes existing like from comment", async () => {
      const mockLike = { id: "like1", commentId, userId };
      prisma.like.findFirst.mockResolvedValue(mockLike);
      prisma.like.delete.mockResolvedValue({});

      const result = await switchCommentLike(commentId, userId);

      expect(prisma.like.findFirst).toHaveBeenCalledWith({
        where: { commentId, userId },
      });
      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: { id: "like1" },
      });
      expect(prisma.like.create).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, action: "unliked" });
    });

    it("adds new like to comment", async () => {
      prisma.like.findFirst.mockResolvedValue(null);
      prisma.like.create.mockResolvedValue({});

      const result = await switchCommentLike(commentId, userId);

      expect(prisma.like.findFirst).toHaveBeenCalledWith({
        where: { commentId, userId },
      });
      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { commentId, userId, postId: null },
      });
      expect(prisma.like.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, action: "liked" });
    });

    it("throws error on database failure during find", async () => {
      prisma.like.findFirst.mockRejectedValue(new Error("DB Error"));

      await expect(switchCommentLike(commentId, userId)).rejects.toThrow(
        "Failed to switch comment like"
      );
      expect(prisma.like.findFirst).toHaveBeenCalledWith({
        where: { commentId, userId },
      });
      expect(prisma.like.create).not.toHaveBeenCalled();
      expect(prisma.like.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during create", async () => {
      prisma.like.findFirst.mockResolvedValue(null);
      prisma.like.create.mockRejectedValue(new Error("DB Error"));

      await expect(switchCommentLike(commentId, userId)).rejects.toThrow(
        "Failed to switch comment like"
      );
      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { commentId, userId, postId: null },
      });
      expect(prisma.like.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during delete", async () => {
      const mockLike = { id: "like1", commentId, userId };
      prisma.like.findFirst.mockResolvedValue(mockLike);
      prisma.like.delete.mockRejectedValue(new Error("DB Error"));

      await expect(switchCommentLike(commentId, userId)).rejects.toThrow(
        "Failed to switch comment like"
      );
      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: { id: "like1" },
      });
      expect(prisma.like.create).not.toHaveBeenCalled();
    });
  });

  // deleteComment Tests
  describe("deleteComment", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });

      await expect(deleteComment(commentId, null)).rejects.toThrow(
        "User not authenticated"
      );
      expect(prisma.comment.findUnique).not.toHaveBeenCalled();
    });

    it("deletes comment successfully if user is comment owner", async () => {
      const mockComment = {
        id: commentId,
        userId,
        post: { userId: "otherUser" },
      };
      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockResolvedValue({});

      const result = await deleteComment(commentId, userId);

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: { post: true },
      });
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(result).toEqual({ success: true });
    });

    it("deletes comment successfully if user is post owner", async () => {
      const mockComment = {
        id: commentId,
        userId: "otherUser",
        post: { userId },
      };
      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockResolvedValue({});

      const result = await deleteComment(commentId, userId);

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: { post: true },
      });
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(result).toEqual({ success: true });
    });

    it("returns success if comment does not exist", async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      const result = await deleteComment(commentId, userId);

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: { post: true },
      });
      expect(prisma.comment.delete).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: "Comment already deleted or not found",
      });
    });

    it("throws error if user is neither comment nor post owner", async () => {
      const mockComment = {
        id: commentId,
        userId: "otherUser1",
        post: { userId: "otherUser2" },
      };
      prisma.comment.findUnique.mockResolvedValue(mockComment);

      await expect(deleteComment(commentId, userId)).rejects.toThrow(
        "You can only delete your own comments or comments on your post"
      );
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: { post: true },
      });
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during find", async () => {
      prisma.comment.findUnique.mockRejectedValue(new Error("DB Error"));

      await expect(deleteComment(commentId, userId)).rejects.toThrow(
        "Failed to delete comment: DB Error"
      );
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: { post: true },
      });
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during delete", async () => {
      const mockComment = {
        id: commentId,
        userId,
        post: { userId: "otherUser" },
      };
      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockRejectedValue(new Error("DB Delete Error"));

      await expect(deleteComment(commentId, userId)).rejects.toThrow(
        "Failed to delete comment: DB Delete Error"
      );
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: { post: true },
      });
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });
  });
});
