"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";

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
    // Determine the opposite reaction type
    const oppositeType = reactionType === "like" ? "love" : "like";

    // Start a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Check for existing reaction of the requested type
      const existingReaction =
        reactionType === "like"
          ? await tx.like.findFirst({
              where: { postId, userId },
            })
          : await tx.love.findFirst({
              where: { postId, userId },
            });

      // Check for opposite reaction
      const oppositeReaction =
        oppositeType === "like"
          ? await tx.like.findFirst({
              where: { postId, userId },
            })
          : await tx.love.findFirst({
              where: { postId, userId },
            });

      // If opposite reaction exists, remove it
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

      // Toggle the requested reaction
      if (existingReaction) {
        // Remove the current reaction
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
        // Add the new reaction
        if (reactionType === "like") {
          await tx.like.create({
            data: { postId, userId },
          });
        } else {
          await tx.love.create({
            data: { postId, userId },
          });
        }
      }
    });
    return { success: true, reactionType };
  } catch (error) {
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
      await prisma.like.create({
        data: {
          commentId,
          userId,
          postId: null, // Assuming Like model allows null postId for comment likes
        },
      });
      return { success: true, action: "liked" };
    }
  } catch (error) {
    //console.error("Error switching comment like:", error);
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
    console.error("Error creating notification:", error);
  }
}

export async function notifyUserCreated(userId) {
  // Notify all users (or a specific group, e.g., admins) about new user
  const sender = await prisma.user.findUnique({ where: { id: userId } });
  const message = `${sender.username} just joined the platform!`;

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

  const message = `${post.user.username} created a new post.`;

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
    const message = `${comment.user.username} commented on your post.`;
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
      reaction.user.username
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

  const message = `${story.user.username} posted a new story.`;

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
