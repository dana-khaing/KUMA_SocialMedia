import FriendRequest from "@/components/userfriends/friendRequest";
import OnlineFriends from "@/components/userfriends/onlineFriends";
import ProfileBigCard from "@/components/userInfo/profileBigCard";
import UsefulTool from "@/components/home/usefulTool";
import Newfeed from "@/components/home/newfeed";
import UserDetail from "@/components/userInfo/userDetail";
import UserMedia from "@/components/userInfo/userMedia";
import { notFound } from "next/navigation";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";

const ProfilePage = async ({ params }) => {
  const { id } = await params;

  // Fetch user data
  const user = await prisma.user.findFirst({
    where: {
      id,
    },
    include: {
      _count: {
        select: { followers: true, followings: true, posts: true },
      },
    },
  });

  if (!user) {
    return notFound();
  }
  /// fetch all posts of the profiles user
  const posts =
    (await prisma.post.findMany({
      where: {
        userId: id,
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        loves: {
          select: {
            userId: true,
          },
        },

        _count: {
          select: { comments: true, likes: true, loves: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })) || [];

  const { userId } = await auth();
  const isOwner = userId === id;
  let isBlocked = false;
  if (!isOwner && userId) {
    const blocked = await prisma.block.findFirst({
      where: {
        blockerId: id,
        blockedId: userId,
      },
    });
    if (blocked) {
      isBlocked = true;
    }
    if (isBlocked) {
      return notFound();
    }
  }

  return (
    <div className="h-screen w-full flex items-start justify-center gap-4 p-4">
      {/* left */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        {!isOwner ? <ProfileSmallCard user={user} /> : <FriendRequest />}
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-screen px-2 flex-col lg:w-[50%] shrink-0 gap-5 h-screen overflow-y-scroll scrollbar-hide overscroll-x-none">
        <div className="h-fit">
          <ProfileBigCard user={user} owner={isOwner} />
        </div>
        <div className="flex lg:hidden">
          <Suspense fallback={<div>Loading...</div>}>
            <UserDetail user={user} owner={isOwner} />
          </Suspense>
        </div>
        <div className="flex lg:hidden">
          <Suspense fallback={<div>Loading...</div>}>
            <UserMedia user={user} />
          </Suspense>
        </div>
        <div className="flex flex-col gap-5 w-full">
          <Newfeed user={user} posts={posts} />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <Suspense fallback={<div>Loading...</div>}>
          <UserDetail user={user} owner={isOwner} />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <UserMedia user={user} />
        </Suspense>
        <OnlineFriends />
      </div>
    </div>
  );
};

export default ProfilePage;
