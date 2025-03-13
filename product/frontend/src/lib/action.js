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
    bio: z.string().max(250).optional(),
    city: z.string().max(60).optional(),
    school: z.string().max(60).optional(),
    work: z.string().max(60).optional(),
    website: z.string().max(60).optional(),
  });
  const validateFields = Profile.safeParse({ cover, ...filteredFields });
  if (!validateFields.success) {
    console.log("parsing went wrong");
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
    console.error("Search error:", error);
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
    console.log("like switch");
  } catch (error) {
    throw new Error("Something went wrong, Kuma");
  }
};
