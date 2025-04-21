"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
import { compareDesc } from "date-fns";

// Follow action

export const followAction = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) {
    throw new Error("User not authenticated");
  }
  try {
    const existingFollow = await prisma.follower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });
    if (existingFollow) {
      await prisma.follower.delete({
        where: {
          id: existingFollow.id,
        },
      });
    } else {
      const existingFollowRequest = await prisma.followRequest.findFirst({
        where: {
          senderId: currentUserId,
          receiverId: userId,
        },
      });

      if (existingFollowRequest) {
        await prisma.followRequest.delete({
          where: {
            id: existingFollowRequest.id,
          },
        });
      } else {
        await prisma.followRequest.create({
          data: {
            senderId: currentUserId,
            receiverId: userId,
          },
        });
      }
    }
  } catch (error) {
    // console.log(error);
    throw new Error("Something went wrong, Kuma");
  }
};

// Block action
export const blockAction = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) {
    throw new Error("User not authenticated");
  }
  try {
    const existingBlock = await prisma.block.findFirst({
      where: {
        blockerId: currentUserId,
        blockedId: userId,
      },
    });
    if (existingBlock) {
      await prisma.block.delete({
        where: {
          id: existingBlock.id,
        },
      });
    } else {
      // if current user is following the user, unfollow the user and block
      const existingFollow = await prisma.follower.findFirst({
        where: {
          followerId: currentUserId,
          followingId: userId,
        },
      });
      if (existingFollow) {
        await prisma.follower.delete({
          where: {
            id: existingFollow.id,
          },
        });
      }
      const existingFollowRequest = await prisma.followRequest.findFirst({
        where: {
          senderId: currentUserId,
          receiverId: userId,
        },
      });
      if (existingFollowRequest) {
        await prisma.followRequest.delete({
          where: {
            id: existingFollowRequest.id,
          },
        });
      }
      await prisma.block.create({
        data: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      });
    }
  } catch (error) {
    // console.log(error);
    throw new Error("Something went wrong, Kuma");
  }
};

// Accept follow request action
export const acceptFollowRequest = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) {
    throw new Error("User not authenticated");
  }
  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
      },
    });
    if (existingFollowRequest) {
      await prisma.followRequest.delete({
        where: {
          id: existingFollowRequest.id,
        },
      });
      await prisma.follower.create({
        data: {
          followerId: userId,
          followingId: currentUserId,
        },
      });
    }
  } catch (error) {
    // console.log(error);
    throw new Error("Something went wrong, Kuma");
  }
};

// Reject follow request action
export const rejectFollowRequest = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) {
    throw new Error("User not authenticated");
  }
  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
      },
    });
    if (existingFollowRequest) {
      await prisma.followRequest.delete({
        where: {
          id: existingFollowRequest.id,
        },
      });
    }
  } catch (error) {
    // console.log(error);
    throw new Error("Something went wrong, Kuma");
  }
};

export const updateProfile = async (data, cover) => {
  const fields = Object.fromEntries(data);

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([_, value]) => value !== "")
  );
  const Profile = z.object({
    cover: z.string().optional(),
    name: z.string().max(10).optional(),
    surname: z.string().max(10).optional(),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
      .optional()
      .transform((val) => (val ? new Date(val) : undefined))
      .refine(
        (val) => !val || (val instanceof Date && !isNaN(val.getTime())),
        "Invalid date"
      ),
    bio: z.string().max(250).optional(),
    city: z.string().max(60).optional(),
    school: z.string().max(60).optional(),
    work: z.string().max(60).optional(),
    website: z.string().max(60).optional(),
  });
  const validateFields = Profile.safeParse({ cover, ...filteredFields });
  if (!validateFields.success) {
    // console.log("parsing went wrong");
    throw new Error("Something went wrong, Kuma");
  }
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: validateFields.data,
    });
    return { success: true };
  } catch (error) {
    throw new Error("Something went wrong, Kuma");
  }
};

// search action
export const searchAction = async (query) => {
  try {
    return await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.toLowerCase() } },
          { surname: { contains: query.toLowerCase() } },
          { username: { contains: query.toLowerCase() } },
        ],
      },
    });
  } catch (error) {
    //console.error("Search error:", error);
    throw new Error("Something went wrong, Kuma");
  }
};

export const switchLike = async (postId, userId) => {
  if (!userId) {
    throw new Error("User not authenticated");
  }
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });
    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
    }
    //console.log("like switch");
  } catch (error) {
    throw new Error("Something went wrong, Kuma");
  }
};

export const switchReaction = async (postId, userId, reactionType) => {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    let reactionId;
    await prisma.$transaction(async (tx) => {
      const oppositeType = reactionType === "like" ? "love" : "like";

      const existingReaction =
        reactionType === "like"
          ? await tx.like.findFirst({
              where: { postId, userId },
            })
          : await tx.love.findFirst({
              where: { postId, userId },
            });

      const oppositeReaction =
        oppositeType === "like"
          ? await tx.like.findFirst({
              where: { postId, userId },
            })
          : await tx.love.findFirst({
              where: { postId, userId },
            });

      if (oppositeReaction) {
        if (oppositeType === "like") {
          await tx.like.delete({
            where: { id: oppositeReaction.id },
          });
        } else {
          await tx.love.delete({
            where: { id: oppositeReaction.id },
          });
        }
      }

      if (existingReaction) {
        if (reactionType === "like") {
          await tx.like.delete({
            where: { id: existingReaction.id },
          });
        } else {
          await tx.love.delete({
            where: { id: existingReaction.id },
          });
        }
      } else {
        if (reactionType === "like") {
          const newLike = await tx.like.create({
            data: { postId, userId },
          });
          reactionId = newLike.id;
        } else {
          const newLove = await tx.love.create({
            data: { postId, userId },
          });
          reactionId = newLove.id;
        }
      }
    });

    // Trigger notification for reaction creation if a new reaction was added
    if (reactionId) {
      await notifyReactionCreated(reactionType.toUpperCase(), reactionId);
    }

    return { success: true, reactionType };
  } catch (error) {
    console.error("Error switching reaction:", error);
    throw new Error("Something went wrong, Kuma");
  }
};

export const deletePost = async (postId, userId) => {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Verify the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== userId) {
      throw new Error("You can only delete your own posts");
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    //console.log(`Post ${postId} deleted by user ${userId}`);
    return { success: true };
  } catch (error) {
    //console.error("Error deleting post:", error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

export const loadComments = async (postId) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      include: {
        user: true,
        likes: true,
      },
    });
    return comments;
  } catch (error) {
    //console.error("Error loading comments:", error);
    throw new Error("Failed to load comments. Kuma");
  }
};

export const createComment = async (postId, userId, desc) => {
  if (!userId) {
    throw new Error("User not authenticated");
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        desc,
      },
      include: {
        user: true,
        likes: true,
      },
    });
    // Notify the post owner about the new comment
    await notifyCommentCreated(comment.id);
    return { success: true, comment };
  } catch (error) {
    //console.error("Error creating comment:", error);
    throw new Error("Failed to create comment");
  }
};

export const switchCommentLike = async (commentId, userId) => {
  if (!userId) {
    throw new Error("User not authenticated");
  }
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { success: true, action: "unliked" };
    } else {
      const newLike = await prisma.like.create({
        data: {
          commentId,
          userId,
          postId: null,
        },
      });
      await notifyCommentLikeCreated(newLike.id);
      return { success: true, action: "liked" };
    }
  } catch (error) {
    throw new Error("Failed to switch comment like");
  }
};

export const deleteComment = async (commentId, userId) => {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) {
      return { success: true, message: "Comment already deleted or not found" }; // Treat as success
    }

    if (comment.userId !== userId && comment.post.userId !== userId) {
      throw new Error(
        "You can only delete your own comments or comments on your post"
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    //console.log(`Comment ${commentId} deleted by user ${userId}`);
    return { success: true };
  } catch (error) {
    //console.error("Error deleting comment:", error);
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
};

export const createPost = async (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload: must be an object");
  }

  const { userId, desc, imageUrls } = payload;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const postData = {
      userId,
    };

    if (desc && desc.trim()) {
      postData.desc = desc.trim();
    }

    // Validate that there's either a description or at least one image
    if (!postData.desc && (!imageUrls || imageUrls.length === 0)) {
      throw new Error("Post must contain text or at least one image");
    }

    // Create the post with related images if provided
    const post = await prisma.post.create({
      data: {
        ...postData,
        images:
          imageUrls && imageUrls.length > 0
            ? {
                create: imageUrls.map((url) => ({
                  url,
                })),
              }
            : undefined,
      },
      include: {
        user: true,
        images: true,
        _count: { select: { likes: true, loves: true, comments: true } },
      },
    });
    // Notify followers about the new post
    await notifyPostCreated(post.id);

    return { success: true, post };
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
};

// create story
export const createStory = async (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload: must be an object");
  }

  const { userId, imageUrl } = payload;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!imageUrl) {
    throw new Error("Story must contain an image");
  }

  try {
    const storyData = {
      userId,
      image: imageUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    if (!storyData.image) {
      throw new Error("Story must contain an image");
    }

    const story = await prisma.story.create({
      data: storyData,
      include: {
        user: true,
      },
    });
    await notifyStoryCreated(story.id);
    return { success: true, story };
  } catch (error) {
    //console.error("Error creating story:", error);
    throw new Error("Failed to create story");
  }
};
// delete story
export const deleteStory = async (storyId, userId) => {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: { user: true },
    });

    if (!story) {
      return { success: true, message: "Story already deleted or not found" }; // Treat as success
    }

    if (story.userId !== userId) {
      throw new Error("You can only delete your own stories");
    }

    await prisma.story.delete({
      where: { id: storyId },
    });

    //console.log(`Story ${storyId} deleted by user ${userId}`);
    return { success: true };
  } catch (error) {
    //console.error("Error deleting story:", error);
    throw new Error(`Failed to delete story: ${error.message}`);
  }
};

export async function createNotification({
  type,
  message,
  senderId,
  receiverId,
  postId,
  commentId,
  storyId,
}) {
  try {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type,
        senderId,
        receiverId,
        commentId,
        postId,
        storyId,
      },
    });

    if (existingNotification) {
      return;
    }

    await prisma.notification.create({
      data: {
        type,
        message,
        senderId,
        receiverId,
        postId,
        commentId,
        storyId,
      },
    });
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

export async function notifyUserCreated(userId) {
  // Notify all users (or a specific group, e.g., admins) about new user
  const sender = await prisma.user.findUnique({ where: { id: userId } });
  const message = `${
    sender.name + " " + sender.surname
  } just joined the platform!`;

  // Example: Notify all users (modify as needed)
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    select: { id: true },
  });

  for (const user of users) {
    await createNotification({
      type: "USER_CREATED",
      message,
      senderId: userId,
      receiverId: user.id,
    });
  }
}

export async function notifyPostCreated(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true },
  });

  const followers = await prisma.follower.findMany({
    where: { followingId: post.userId },
    select: { followerId: true },
  });

  const message = `${
    post.user.name + " " + post.user.surname
  } created a new post. Check it out! Kuma!`;

  for (const follower of followers) {
    await createNotification({
      type: "POST_CREATED",
      message,
      senderId: post.userId,
      receiverId: follower.followerId,
      postId,
    });
  }
}

export async function notifyCommentCreated(commentId) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { user: true, post: { include: { user: true } } },
  });

  // Notify the post owner (if not the commenter)
  if (comment.userId !== comment.post.userId) {
    const message = `${
      comment.user.name + " " + comment.user.surname
    } commented "${comment.desc}" on your post. Check it out! Kuma!`;
    await createNotification({
      type: "COMMENT",
      message,
      senderId: comment.userId,
      receiverId: comment.post.userId,
      postId: comment.postId,
      commentId,
    });
  }
}

export async function notifyReactionCreated(reactionType, reactionId) {
  let reaction;
  if (reactionType === "LIKE") {
    reaction = await prisma.like.findUnique({
      where: { id: reactionId },
      include: { user: true, post: { include: { user: true } } },
    });
  } else if (reactionType === "LOVE") {
    reaction = await prisma.love.findUnique({
      where: { id: reactionId },
      include: { user: true, post: { include: { user: true } } },
    });
  }

  if (!reaction || !reaction.post) return;

  // Notify the post owner (if not the reactor)
  if (reaction.userId !== reaction.post.userId) {
    const message = `${
      reaction.user.name + " " + reaction.user.surname
    } ${reactionType.toLowerCase()}d your post.`;
    await createNotification({
      type: reactionType,
      message,
      senderId: reaction.userId,
      receiverId: reaction.post.userId,
      postId: reaction.postId,
    });
  }
}

export async function notifyStoryCreated(storyId) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { user: true },
  });

  const followers = await prisma.follower.findMany({
    where: { followingId: story.userId },
    select: { followerId: true },
  });

  const message = `${
    story.user.name + " " + story.user.surname
  } posted a new story. Check it out! Kuma!`;

  for (const follower of followers) {
    await createNotification({
      type: "STORY_CREATED",
      message,
      senderId: story.userId,
      receiverId: follower.followerId,
      storyId,
    });
  }
}
export async function notifyCommentLikeCreated(likeId) {
  try {
    const like = await prisma.like.findUnique({
      where: { id: likeId },
      include: {
        user: { select: { id: true, username: true } },
        comment: {
          include: {
            user: { select: { id: true } },
            post: { select: { id: true } },
          },
        },
      },
    });

    if (
      !like ||
      !like.comment ||
      !like.user ||
      !like.comment.user ||
      !like.user.username
    ) {
      return; // Silently return if data is incomplete
    }

    if (like.userId !== like.comment.userId) {
      const message = `${
        like.user.name + " " + like.user.surname
      } liked your comment.`;
      await createNotification({
        type: "COMMENT_LIKE",
        message,
        senderId: like.userId,
        receiverId: like.comment.userId,
        postId: like.comment.postId,
        commentId: like.comment.id,
      });
    }
  } catch (error) {
    throw new Error(
      `Failed to create comment like notification: ${error.message}`
    );
  }
}

export const markNotificationAsRead = async (notificationId, userId) => {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        receiverId: userId, // Ensure the user owns the notification
      },
      data: {
        read: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
};
