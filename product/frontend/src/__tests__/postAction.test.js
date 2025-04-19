import { createComment, deletePost } from "@/lib/action";
import { auth } from "@clerk/nextjs/server";
import prisma from "../lib/client";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

// Mock Prisma client
jest.mock("../lib/client", () => ({
  comment: {
    create: jest.fn(),
  },
  post: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Server Actions", () => {
  const userId = "user123";
  const postId = 456;
  const currentUserId = "currentUser789";
  const commentDesc = "This is a test comment";

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ userId: currentUserId });
  });

  // createComment Tests
  describe("createComment", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });
      await expect(createComment(postId, null, commentDesc)).rejects.toThrow(
        "User not authenticated"
      );
    });

    it("creates a comment successfully", async () => {
      const mockComment = {
        id: "comment1",
        postId,
        userId: currentUserId,
        desc: commentDesc,
        user: {
          id: currentUserId,
          name: "Test User",
          username: "testuser",
          avatar: "/avatar.png",
        },
        likes: [],
      };
      prisma.comment.create.mockResolvedValue(mockComment);

      const result = await createComment(postId, currentUserId, commentDesc);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId,
          userId: currentUserId,
          desc: commentDesc,
        },
        include: {
          user: true,
          likes: true,
        },
      });
      expect(result).toEqual({ success: true, comment: mockComment });
    });

    it("throws error on database failure", async () => {
      prisma.comment.create.mockRejectedValue(new Error("DB Error"));
      await expect(
        createComment(postId, currentUserId, commentDesc)
      ).rejects.toThrow("Failed to create comment");
    });
  });

  // deletePost Tests
  describe("deletePost", () => {
    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });
      await expect(deletePost(postId, null)).rejects.toThrow(
        "User not authenticated"
      );
    });

    it("throws error if post is not found", async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      await expect(deletePost(postId, currentUserId)).rejects.toThrow(
        "Post not found"
      );

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("throws error if user is not the post owner", async () => {
      const mockPost = {
        id: postId,
        userId: "otherUser456",
      };
      prisma.post.findUnique.mockResolvedValue(mockPost);

      await expect(deletePost(postId, currentUserId)).rejects.toThrow(
        "You can only delete your own posts"
      );

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("deletes post successfully if user is the owner", async () => {
      const mockPost = {
        id: postId,
        userId: currentUserId,
      };
      prisma.post.findUnique.mockResolvedValue(mockPost);
      prisma.post.delete.mockResolvedValue({});

      const result = await deletePost(postId, currentUserId);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(result).toEqual({ success: true });
    });

    it("throws error on database failure during find", async () => {
      prisma.post.findUnique.mockRejectedValue(new Error("DB Error"));
      await expect(deletePost(postId, currentUserId)).rejects.toThrow(
        "Failed to delete post: DB Error"
      );
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("throws error on database failure during delete", async () => {
      const mockPost = {
        id: postId,
        userId: currentUserId,
      };
      prisma.post.findUnique.mockResolvedValue(mockPost);
      prisma.post.delete.mockRejectedValue(new Error("DB Delete Error"));

      await expect(deletePost(postId, currentUserId)).rejects.toThrow(
        "Failed to delete post: DB Delete Error"
      );

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
    });
  });
});
