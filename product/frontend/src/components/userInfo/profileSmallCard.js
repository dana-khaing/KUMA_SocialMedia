import { Separator } from "../ui/separator";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
export const ProfileSmallCard = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      _count: {
        select: { followers: true, followings: true, posts: true },
      },
    },
  });

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-col cursor-default overflow-hidden pb-4">
      {/* Cover photo */}
      <div className="h-[15rem]">
        <div className="relative w-full mb-12 h-[50%]">
          <img
            src={user?.cover || "/cover-default.png"}
            alt="Coverphoto"
            className="rounded-t-2xl fill-transparent w-full h-full object-cover"
          />
          <img
            src={user?.avatar || "/user-default.png"}
            alt="profile"
            className="w-20 h-20 rounded-full ring-2 ring-white -bottom-10 absolute left-1/2 transform -translate-x-1/2 bg-white object-cover"
          />
        </div>
        {/* Full name and username */}
        <div className="flex flex-col items-center justify-center px-4">
          <span className="text-black font-bold">
            {user?.name && user?.surname
              ? user?.name + " " + user?.surname
              : "Kuma User"}
          </span>
          <span className="text-gray-500">@{user?.username || "username"}</span>
        </div>
        {/* Bio */}
        <div className="flex flex-col items-center justify-center px-4">
          <span className="text-black font-bold">Bio</span>
          <span className="text-gray-500 line-clamp-1">
            {user?.bio || "No bio yet, Kuma"}
          </span>
        </div>
      </div>
      {/* User's friends, followers, and following */}
      <div className="flex justify-center items-center gap-2 py-2 mt-2">
        <div className="flex flex-col text-center items-center justify-center">
          <span className="text-black font-bold">Posts</span>
          <span className="text-gray-500">{user?._count.posts}</span>
        </div>
        <Separator orientation="vertical" className="h-8 bg-[#FF4E01]" />
        <div className="flex flex-col text-center items-center justify-center">
          <span className="text-black font-bold">Followers</span>
          <span className="text-gray-500">{user?._count.followers}</span>
        </div>
        <Separator orientation="vertical" className="h-8 bg-[#FF4E01]" />
        <div className="flex flex-col text-center items-center justify-center">
          <span className="text-black font-bold">Following</span>
          <span className="text-gray-500">{user?._count.followings}</span>
        </div>
      </div>
      {/* View Profile button */}
      <div className="flex items-center justify-center m-2 text-center">
        <Link
          href={"/profile/" + user?.id}
          className="w-36 h-10 py-2 rounded-full shadow-md py-auto bg-[#FF4E01] text-white hover:scale-105 transition-transform duration-75 ease-out hover:text-[#FF4E01] hover:drop-shadow-lg hover:bg-white cursor-pointer text-center items-center justify-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default ProfileSmallCard;
