// app/post/[postId]/page.jsx
import FriendRequest from "@/components/userfriends/friendRequest";
import Checkfriends from "@/components/userfriends/checkfriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import Newfeed from "@/components/home/newfeed";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>User not found.</p>
      </div>
    );
  }

  const chosenPost = await fetchPost(postId, userId);

  if (!chosenPost) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>Post not found or inaccessible due to privacy settings.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-start justify-center gap-4 p-4">
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      <div className="flex w-screen px-2 flex-col lg:w-[50%] shrink-0 gap-5 overflow-y-scroll scrollbar-hide overscroll-x-none">
        <div className="flex flex-col gap-5 h-screen overflow-y-scroll scrollbar-hide overscroll-x-none">
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
