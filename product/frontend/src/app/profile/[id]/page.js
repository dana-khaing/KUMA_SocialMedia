import FriendRequest from "@/components/userfriends/friendRequest";
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
import Checkfriends from "@/components/userfriends/checkfriends";

const ProfilePage = async ({ params }) => {
  const { id } = await params;

  // Fetch user data
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        _count: {
          select: { followers: true, followings: true, posts: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch user:", error.message);
    return notFound();
  }

  if (!user) {
    return notFound();
  }

  // Fetch all posts of the profile user
  let posts = [];
  try {
    posts = await prisma.post.findMany({
      where: {
        userId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          },
        },
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
        images: true,
        comments: true,
        _count: {
          select: {
            comments: true,
            likes: true,
            loves: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch posts:", error.message);
    posts = [];
  }

  // Fetch posts with media
  let postWithMedia = [];
  try {
    postWithMedia = await prisma.post.findMany({
      where: {
        userId: id,
        images: { some: {} },
      },
      include: {
        images: {
          include: {
            post: { select: { id: true, desc: true, createdAt: true } },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          },
        },
        _count: { select: { comments: true, likes: true, loves: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch posts with media:", error.message);
    postWithMedia = [];
  }

  const { userId } = await auth();
  const isOwner = userId === id;
  let isBlocked = false;

  if (!isOwner && userId) {
    try {
      const blocked = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: id, blockedId: userId },
            { blockerId: userId, blockedId: id },
          ],
        },
      });
      if (blocked) {
        isBlocked = true;
      }
    } catch (error) {
      console.error("Failed to check block status:", error.message);
      isBlocked = false;
    }

    if (isBlocked) {
      return notFound();
    }
  }

  return (
    <div className="h-screen w-full flex items-start justify-center gap-4 p-4">
      {/* Left */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        {!isOwner ? <ProfileSmallCard user={user} /> : <FriendRequest />}
        <UsefulTool />
      </div>
      {/* Center */}
      <div className="flex w-screen px-2 flex-col lg:w-[50%] shrink-0 gap-5 h-[180vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
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
            <UserMedia user={user} postWithMedia={postWithMedia} />
          </Suspense>
        </div>
        <div className="flex flex-col gap-5 w-full h-full">
          <Suspense fallback={<div>Loading posts...</div>}>
            <Newfeed user={user} posts={posts} owner={userId} />
          </Suspense>
        </div>
      </div>
      {/* Right */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <Suspense fallback={<div>Loading...</div>}>
          <UserDetail user={user} owner={isOwner} />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <UserMedia user={user} postWithMedia={postWithMedia} />
        </Suspense>
        <Checkfriends />
      </div>
    </div>
  );
};

export default ProfilePage;
