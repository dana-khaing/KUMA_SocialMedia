"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
import {
  triggerNotificationCreated,
  triggerPostCommentCreated,
  triggerPostReactionUpdated,
  triggerFriendRequestSent,
} from "./pusherServer";
import { isDatabaseUnavailableError } from "./databaseStatus";

// Follow action (kept for backward compat)
export const followAction = async (userId) => {
  return sendFriendRequest(userId);
};

// Send friend request
export const sendFriendRequest = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) throw new Error("User not authenticated");
  try {
    const existingFriend = await prisma.friend.findFirst({
      where: { userId: currentUserId, friendId: userId },
    });
    if (existingFriend) return;

    const existingRequest = await prisma.followRequest.findFirst({
      where: { senderId: currentUserId, receiverId: userId },
    });
    if (existingRequest) {
      await prisma.followRequest.delete({ where: { id: existingRequest.id } });
    } else {
      await prisma.followRequest.create({
        data: { senderId: currentUserId, receiverId: userId },
      });
      const sender = await prisma.user.findUnique({ where: { id: currentUserId } });
      await notifyFriendRequestSent(currentUserId, userId);
      await triggerFriendRequestSent({ senderId: currentUserId, receiverId: userId, sender });
    }
  } catch (error) {
    throw new Error("Something went wrong, Kuma");
  }
};

// Unfriend — removes friendship and both follow directions
export const unfriendAction = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) throw new Error("User not authenticated");
  try {
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { userId: currentUserId, friendId: userId },
          { userId: userId, friendId: currentUserId },
        ],
      },
    });
    await prisma.follower.deleteMany({
      where: {
        OR: [
          { followerId: currentUserId, followingId: userId },
          { followerId: userId, followingId: currentUserId },
        ],
      },
    });
  } catch (error) {
    throw new Error("Something went wrong, Kuma");
  }
};

// Unfollow — stays friends but A stops seeing B's posts
export const unfollowAction = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) throw new Error("User not authenticated");
  try {
    await prisma.follower.deleteMany({
      where: { followerId: currentUserId, followingId: userId },
    });
  } catch (error) {
    throw new Error("Something went wrong, Kuma");
  }
};

// Follow a friend — re-follow after unfollowing (must already be friends)
export const followFriendAction = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) throw new Error("User not authenticated");
  try {
    const existingFriend = await prisma.friend.findFirst({
      where: { userId: currentUserId, friendId: userId },
    });
    if (!existingFriend) return;
    await prisma.follower.create({
      data: { followerId: currentUserId, followingId: userId },
    });
  } catch (error) {
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
      await prisma.friend.deleteMany({
        where: {
          OR: [
            { userId: currentUserId, friendId: userId },
            { userId: userId, friendId: currentUserId },
          ],
        },
      });
      await prisma.follower.deleteMany({
        where: {
          OR: [
            { followerId: currentUserId, followingId: userId },
            { followerId: userId, followingId: currentUserId },
          ],
        },
      });
      const existingFollowRequest = await prisma.followRequest.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId },
          ],
        },
      });
      if (existingFollowRequest) {
        await prisma.followRequest.delete({ where: { id: existingFollowRequest.id } });
      }
      await prisma.block.create({
        data: { blockerId: currentUserId, blockedId: userId },
      });
    }
  } catch (error) {
    // console.log(error);
    throw new Error("Something went wrong, Kuma");
  }
};

// Accept friend request
export const acceptFollowRequest = async (userId) => {
  return acceptFriendRequest(userId);
};

export const acceptFriendRequest = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) throw new Error("User not authenticated");
  try {
    const request = await prisma.followRequest.findFirst({
      where: { senderId: userId, receiverId: currentUserId },
    });
    if (request) {
      await prisma.followRequest.delete({ where: { id: request.id } });
      await prisma.friend.createMany({
        data: [
          { userId: currentUserId, friendId: userId },
          { userId: userId, friendId: currentUserId },
        ],
        skipDuplicates: true,
      });
      // Auto-follow each other when becoming friends
      await prisma.follower.createMany({
        data: [
          { followerId: currentUserId, followingId: userId },
          { followerId: userId, followingId: currentUserId },
        ],
        skipDuplicates: true,
      });
      await notifyFriendRequestAccepted(userId, currentUserId);
    }
  } catch (error) {
    throw new Error("Something went wrong, Kuma");
  }
};

// Reject friend request
export const rejectFollowRequest = async (userId) => {
  return rejectFriendRequest(userId);
};

export const rejectFriendRequest = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) throw new Error("User not authenticated");
  try {
    const request = await prisma.followRequest.findFirst({
      where: { senderId: userId, receiverId: currentUserId },
    });
    if (request) {
      await prisma.followRequest.delete({ where: { id: request.id } });
    }
  } catch (error) {
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
    let action = "added";
    let removedOppositeType = null;
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
        removedOppositeType = oppositeType;
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
        action = "removed";
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

    const [likeCount, loveCount] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      prisma.love.count({ where: { postId } }),
    ]);

    const payload = {
      postId,
      userId,
      reactionType,
      action,
      removedOppositeType,
      counts: {
        likes: likeCount,
        loves: loveCount,
      },
    };

    await triggerPostReactionUpdated(payload);

    return { success: true, ...payload };
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
    const commentCount = await prisma.comment.count({ where: { postId } });
    await triggerPostCommentCreated({ comment, commentCount });
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

  const { userId, desc, imageUrls, taggedUserIds, pollData } = payload;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const postData = { userId };

    if (desc && desc.trim()) {
      postData.desc = desc.trim();
    }

    const validPollOptions = pollData?.options?.filter((o) => o.trim()) ?? [];
    const hasPoll = validPollOptions.length >= 2;

    // Validate: post must have text, image, or a poll
    if (!postData.desc && (!imageUrls || imageUrls.length === 0) && !hasPoll) {
      throw new Error("Post must contain text, at least one image, or a poll");
    }

    // Create the post with related images, tags, and optional poll
    const post = await prisma.post.create({
      data: {
        ...postData,
        images:
          imageUrls && imageUrls.length > 0
            ? { create: imageUrls.map((url) => ({ url })) }
            : undefined,
        tags:
          taggedUserIds && taggedUserIds.length > 0
            ? { create: taggedUserIds.map((uid) => ({ userId: uid })) }
            : undefined,
        poll: hasPoll
          ? {
              create: {
                question: pollData.question?.trim() || null,
                options: {
                  create: validPollOptions.map((text) => ({ text: text.trim() })),
                },
              },
            }
          : undefined,
      },
      include: {
        user: true,
        images: true,
        tags: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        poll: {
          include: {
            options: { include: { votes: { select: { userId: true } } } },
            votes: { select: { userId: true, pollOptionId: true } },
          },
        },
        _count: { select: { likes: true, loves: true, comments: true } },
      },
    });
    // Notify followers about the new post
    await notifyPostCreated(post.id);
    // Notify tagged users
    if (taggedUserIds && taggedUserIds.length > 0) {
      await notifyPostTagged(post.id, taggedUserIds, userId);
    }

    return { success: true, post };
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
};

// cast a vote on a poll option (one vote per user per poll, cannot change after voting)
export const castPollVote = async (pollId, pollOptionId, userId) => {
  if (!pollId || !pollOptionId || !userId) return { success: false };
  try {
    const existing = await prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });
    if (!existing) {
      await prisma.pollVote.create({ data: { pollId, pollOptionId, userId } });
    }
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: { include: { votes: { select: { userId: true } } } },
        votes: { select: { userId: true, pollOptionId: true } },
      },
    });
    return { success: true, poll };
  } catch {
    return { success: false };
  }
};

// share a post to the current user's feed
export const sharePost = async (originalPostId, userId, desc) => {
  if (!originalPostId || !userId) throw new Error("Missing required fields");
  try {
    // always link to the root post — never share a share of a share
    const original = await prisma.post.findUnique({
      where: { id: originalPostId },
      select: { sharedPostId: true, userId: true, user: true },
    });
    if (!original) throw new Error("Post not found");
    const rootPostId = original.sharedPostId ?? originalPostId;
    const rootOwnerId = original.sharedPostId ? null : original.userId;

    const shared = await prisma.post.create({
      data: {
        userId,
        desc: desc?.trim() || null,
        sharedPostId: rootPostId,
      },
      include: {
        user: { select: { id: true, name: true, surname: true, username: true, avatar: true } },
        images: true,
        tags: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        poll: {
          include: {
            options: { include: { votes: { select: { userId: true } } } },
            votes: { select: { userId: true, pollOptionId: true } },
          },
        },
        sharedPost: {
          include: {
            user: { select: { id: true, name: true, surname: true, username: true, avatar: true } },
            images: true,
            tags: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            poll: { include: { options: true } },
          },
        },
        _count: { select: { likes: true, loves: true, comments: true, shares: true } },
      },
    });

    // notify the original post owner (not if sharing your own post)
    const ownerId = rootOwnerId ?? original.userId;
    if (ownerId && ownerId !== userId) {
      await createNotification({
        type: "POST_SHARED",
        message: `${original.user?.name ?? "Someone"} shared your post.`,
        senderId: userId,
        receiverId: ownerId,
        postId: rootPostId,
      });
    }

    return { success: true, post: shared };
  } catch (error) {
    console.error("Error sharing post:", error);
    throw new Error("Failed to share post");
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

// record that a user viewed a story (upsert so duplicate views are ignored)
export const recordStoryView = async (storyId, viewerId) => {
  if (!storyId || !viewerId) return;
  try {
    await prisma.storyView.upsert({
      where: { storyId_userId: { storyId, userId: viewerId } },
      update: { viewedAt: new Date() },
      create: { storyId, userId: viewerId },
    });
  } catch {
    // non-critical, silently ignore
  }
};

// fetch viewers for a story (only the owner should call this from the UI)
export const getStoryViewers = async (storyId) => {
  if (!storyId) return { success: false, viewers: [] };
  try {
    const views = await prisma.storyView.findMany({
      where: { storyId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { viewedAt: "desc" },
    });
    return { success: true, viewers: views.map((v) => v.user) };
  } catch {
    return { success: false, viewers: [] };
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
    if (senderId === receiverId) {
      return null;
    }

    const enabled = await isNotificationEnabled(receiverId, type);

    if (!enabled) {
      return null;
    }

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
      return existingNotification;
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        senderId,
        receiverId,
        postId,
        commentId,
        storyId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    await triggerNotificationCreated(notification);

    return notification;
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

const notificationPreferenceTypeMap = {
  USER_CREATED: "newUsers",
  POST_CREATED: "posts",
  POST_TAGGED: "posts",
  POST_SHARED: "posts",
  STORY_CREATED: "stories",
  COMMENT: "comments",
  POST_COMMENTED: "comments",
  LIKE: "reactions",
  LOVE: "reactions",
  POST_LIKED: "reactions",
  POST_LOVED: "reactions",
  COMMENT_LIKE: "reactions",
  COMMENT_LIKED: "reactions",
  FOLLOW_REQUEST: "follows",
  FOLLOW_ACCEPTED: "follows",
};

function getUtcDayBounds(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

function getNextBirthdayDate(dob, fromDate = new Date()) {
  if (!dob) {
    return null;
  }

  const birthday = new Date(dob);

  if (Number.isNaN(birthday.getTime())) {
    return null;
  }

  const today = new Date(fromDate);
  today.setUTCHours(0, 0, 0, 0);

  const nextBirthday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      birthday.getUTCMonth(),
      birthday.getUTCDate()
    )
  );

  if (nextBirthday < today) {
    nextBirthday.setUTCFullYear(nextBirthday.getUTCFullYear() + 1);
  }

  return nextBirthday;
}

function formatBirthdayNotificationMessage(user, birthdayDate, fromDate) {
  const today = new Date(fromDate);
  today.setUTCHours(0, 0, 0, 0);

  if (birthdayDate.getTime() === today.getTime()) {
    return `${getUserDisplayName(user)} has a birthday today.`;
  }

  const dateText = birthdayDate.toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return `${getUserDisplayName(user)} has a birthday on ${dateText}.`;
}

async function isNotificationEnabled(receiverId, type) {
  const preferenceKey = notificationPreferenceTypeMap[type];

  if (!preferenceKey) {
    return true;
  }

  const preferences = await prisma.notificationPreference.findUnique({
    where: {
      userId: receiverId,
    },
  });

  return preferences ? preferences[preferenceKey] !== false : true;
}

function getUserDisplayName(user) {
  if (!user) {
    return "Someone";
  }

  return (
    [user.name, user.surname].filter(Boolean).join(" ") ||
    user.username ||
    "Someone"
  );
}

export async function generateBirthdayNotificationsForUser(userId, now = new Date()) {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { start, end } = getUtcDayBounds(now);

  const followings = await prisma.follower.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          avatar: true,
          dob: true,
        },
      },
    },
  });

  const createdNotifications = [];

  for (const following of followings) {
    const person = following.following;
    const birthdayDate = getNextBirthdayDate(person?.dob, start);

    if (!person || !birthdayDate || birthdayDate < start || birthdayDate > end) {
      continue;
    }

    const existingNotification = await prisma.notification.findFirst({
      where: {
        type: "BIRTHDAY",
        senderId: person.id,
        receiverId: userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    if (existingNotification) {
      continue;
    }

    const notification = await prisma.notification.create({
      data: {
        type: "BIRTHDAY",
        message: formatBirthdayNotificationMessage(person, birthdayDate, start),
        senderId: person.id,
        receiverId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    await triggerNotificationCreated(notification);
    createdNotifications.push(notification);
  }

  return createdNotifications;
}

export async function notifyUserCreated(userId) {
  // Notify all users (or a specific group, e.g., admins) about new user
  const sender = await prisma.user.findUnique({ where: { id: userId } });

  if (!sender) {
    return;
  }

  const message = `${getUserDisplayName(sender)} just joined the platform!`;

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

  if (!post) {
    return;
  }

  const followers = await prisma.follower.findMany({
    where: { followingId: post.userId },
    select: { followerId: true },
  });

  const message = `${getUserDisplayName(
    post.user
  )} created a new post. Check it out! Kuma!`;

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

async function notifyPostTagged(postId, taggedUserIds, taggerId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true },
  });
  if (!post) return;

  const message = `${getUserDisplayName(post.user)} tagged you in a post.`;

  for (const taggedUserId of taggedUserIds) {
    if (taggedUserId === taggerId) continue;
    await createNotification({
      type: "POST_TAGGED",
      message,
      senderId: taggerId,
      receiverId: taggedUserId,
      postId,
    });
  }
}

export async function notifyCommentCreated(commentId) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { user: true, post: { include: { user: true } } },
  });

  if (!comment) {
    return;
  }

  // Notify the post owner (if not the commenter)
  if (comment.userId !== comment.post.userId) {
    const message = `${getUserDisplayName(comment.user)} commented "${
      comment.desc
    }" on your post. Check it out! Kuma!`;
    await createNotification({
      type: "POST_COMMENTED",
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
    const message = `${getUserDisplayName(
      reaction.user
    )} ${reactionType.toLowerCase()}d your post.`;
    await createNotification({
      type: reactionType === "LOVE" ? "POST_LOVED" : "POST_LIKED",
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

  if (!story) {
    return;
  }

  const followers = await prisma.follower.findMany({
    where: { followingId: story.userId },
    select: { followerId: true },
  });

  const message = `${getUserDisplayName(
    story.user
  )} posted a new story. Check it out! Kuma!`;

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
        user: {
          select: { id: true, username: true, name: true, surname: true },
        },
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
      return;
    }

    if (like.userId !== like.comment.userId) {
      const message = `${
        getUserDisplayName(like.user)
      } liked your comment.`;
      await createNotification({
        type: "COMMENT_LIKED",
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

async function notifyFollowRequestCreated(senderId, receiverId) {
  return notifyFriendRequestSent(senderId, receiverId);
}

async function notifyFriendRequestSent(senderId, receiverId) {
  const sender = await prisma.user.findUnique({ where: { id: senderId } });
  if (!sender) return;
  await createNotification({
    type: "FOLLOW_REQUEST",
    message: `${getUserDisplayName(sender)} sent you a friend request.`,
    senderId,
    receiverId,
  });
}

async function notifyFollowAccepted(followerId, followingId) {
  return notifyFriendRequestAccepted(followerId, followingId);
}

async function notifyFriendRequestAccepted(requesterId, accepterId) {
  const accepter = await prisma.user.findUnique({ where: { id: accepterId } });
  if (!accepter) return;
  await createNotification({
    type: "FOLLOW_ACCEPTED",
    message: `${getUserDisplayName(accepter)} accepted your friend request.`,
    senderId: accepterId,
    receiverId: requesterId,
  });
}

const defaultNotificationPreferences = {
  posts: true,
  stories: true,
  comments: true,
  reactions: true,
  follows: true,
  newUsers: true,
};

const normalizeNotificationPreferences = (preferences = {}) => {
  return Object.fromEntries(
    Object.entries(defaultNotificationPreferences).map(([key, value]) => [
      key,
      typeof preferences[key] === "boolean" ? preferences[key] : value,
    ])
  );
};

const getAuthenticatedUserId = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return userId;
};

const parseNotificationId = (notificationId) => {
  const parsedId = Number(notificationId);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    throw new Error("Invalid notification id");
  }

  return parsedId;
};

export const getUnreadNotificationCount = async () => {
  const userId = await getAuthenticatedUserId();

  try {
    return await prisma.notification.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      console.error("Database unavailable while fetching unread notification count:", error);
      return 0;
    }

    console.error("Error fetching unread notification count:", error);
    throw new Error("Failed to fetch unread notification count");
  }
};

export const markNotificationAsRead = async (notificationId) => {
  const userId = await getAuthenticatedUserId();
  const id = parseNotificationId(notificationId);

  try {
    const result = await prisma.notification.updateMany({
      where: {
        id,
        receiverId: userId,
      },
      data: {
        read: true,
      },
    });
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
};

export const markAllNotificationsAsRead = async () => {
  const userId = await getAuthenticatedUserId();

  try {
    const result = await prisma.notification.updateMany({
      where: {
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Failed to mark all notifications as read");
  }
};

export const deleteNotification = async (notificationId) => {
  const userId = await getAuthenticatedUserId();
  const id = parseNotificationId(notificationId);

  try {
    const result = await prisma.notification.deleteMany({
      where: {
        id,
        receiverId: userId,
      },
    });
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error("Failed to delete notification");
  }
};

export const clearReadNotifications = async () => {
  const userId = await getAuthenticatedUserId();

  try {
    const result = await prisma.notification.deleteMany({
      where: {
        receiverId: userId,
        read: true,
      },
    });
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error clearing read notifications:", error);
    throw new Error("Failed to clear read notifications");
  }
};

export const getNotificationPreferences = async () => {
  const userId = await getAuthenticatedUserId();

  try {
    const preferences = await prisma.notificationPreference.findUnique({
      where: {
        userId,
      },
    });

    return {
      userId,
      ...defaultNotificationPreferences,
      ...(preferences ? normalizeNotificationPreferences(preferences) : {}),
    };
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw new Error("Failed to fetch notification preferences");
  }
};

export const updateNotificationPreferences = async (preferences) => {
  const userId = await getAuthenticatedUserId();
  const data = normalizeNotificationPreferences(preferences ?? {});

  try {
    const updatedPreferences = await prisma.notificationPreference.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return {
      success: true,
      preferences: {
        userId,
        ...normalizeNotificationPreferences(updatedPreferences),
      },
    };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw new Error("Failed to update notification preferences");
  }
};
