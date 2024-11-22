"use client";

import FriendRequest from "@/components/home/friendRequest";
import OnlineFriends from "@/components/home/onlineFriends";
import ProfileBigCard from "@/components/home/profileBigCard";
import UsefulTool from "@/components/home/usefulTool";
import { useUser } from "@clerk/nextjs";
const Profilepage = () => {
  const { user } = useUser();
  return (
    <div className="h-[120vh] w-screen flex items-start justify-center gap-4 py-4">
      {/* left */}
      <div className="hidden lg:block flex-col w-[25%]">
        <FriendRequest />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-full flex-col lg:w-[50%] gap-5">
        <div className="flex flex-col gap-5 w-[100%] h-[150vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
          <ProfileBigCard user={user} />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <OnlineFriends />
      </div>
    </div>
  );
};

export default Profilepage;
