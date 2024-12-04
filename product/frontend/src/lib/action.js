"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@lib/prisma";

export const followAction = async (userId) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) {
    throw new Error("User not authenticated");
  }
  try {
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });
    if (existingFollow) {
      await prisma.follow.delete({
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
    console.error(error);
    throw new Error("Something went wrong, Kuma");
  }
};
