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

const Profilepage = async ({ params }) => {
  const { Id } = await params;
  const user = await prisma.user.findFirst({
    where: {
      id: Id,
    },
    include: {
      _count: {
        select: { followers: true, followings: true, posts: true },
      },
    },
  });
  // I want to pass the user's id to the profile page
  if (!user) {
    return notFound();
  }
  // check the profile is user's profile or not(it can be the other person's profile)
  const { userId } = await auth();
  let isOwner = false;
  if (userId === Id) {
    isOwner = true;
  }
  // check the user is blocked or not
  let isBlocked = false;
  if (userId) {
    const blocked = await prisma.block.findFirst({
      where: {
        userId: Id,
        blockedId: userId,
      },
    });
    if (blocked) {
      isBlocked = true;
    }
  }
  if (isBlocked) {
    return notFound();
  }

  return (
    <div className="h-[120vh] w-screen flex items-start justify-center gap-4 py-4">
      {/* left */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <FriendRequest />
        <OnlineFriends />
      </div>
      {/* center */}
      <div className="flex w-full flex-col lg:w-[50%] gap-5 h-[150vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
        <div className="h-fit">
          <ProfileBigCard user={user} />
        </div>
        <div className="flex lg:hidden">
          <UserDetail />
        </div>
        <div className="flex lg:hidden">
          <UserMedia />
        </div>
        <div className="flex flex-col gap-5 w-full">
          <Newfeed />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <UserDetail />
        <UserMedia />
        <UsefulTool />
      </div>
    </div>
  );
};

export default Profilepage;
