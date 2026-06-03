// app/post/[postId]/page.jsx
import FriendRequest from "@/components/userfriends/friendRequest";
import Checkfriends from "@/components/userfriends/checkfriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import Newfeed from "@/components/home/newfeed";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import BetaDatabaseFallback from "@/components/common/betaDatabaseFallback";
import { isDatabaseUnavailableError } from "@/lib/databaseStatus";

async function fetchPost(postId, userId) {
  // Validate postId
  if (!postId || isNaN(parseInt(postId))) {
    return null; // Invalid postId
  }

  const parsedPostId = parseInt(postId);

  const chosenPost = await prisma.post.findUnique({
    where: {
      id: parsedPostId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          avatar: true,
        },
      },
      likes: {
        select: {
          userId: true,
          createdAt: true,
        },
      },
      loves: {
        select: {
          userId: true,
          createdAt: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              username: true,
              avatar: true,
            },
          },
          likes: {
            select: {
              userId: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      images: true,
      _count: { select: { likes: true, loves: true, comments: true } },
    },
  });

  if (!chosenPost) return null;

  // Check block status
  const blockCheck = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: chosenPost.userId },
        { blockerId: chosenPost.userId, blockedId: userId },
      ],
    },
  });

  if (blockCheck) return null;

  return chosenPost;
}

export default async function Post({ params }) {
  const { postId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>Please log in to view this post.</p>
      </div>
    );
  }

  let user;
  let chosenPost;

  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });

    chosenPost = await fetchPost(postId, userId);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return <BetaDatabaseFallback />;
    }

    throw error;
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>User not found.</p>
      </div>
    );
  }

  if (!chosenPost) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>Post not found or inaccessible due to privacy settings.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-start justify-center gap-4 p-4">
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      <div className="flex w-screen shrink-0 flex-col gap-5 px-2 lg:w-[50%]">
        <div className="flex flex-col gap-5">
          <Newfeed
            posts={[chosenPost]}
            user={user}
            owner={userId}
            autoOpenCommentId={chosenPost.id}
          />
        </div>
      </div>
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Checkfriends />
      </div>
    </div>
  );
}
