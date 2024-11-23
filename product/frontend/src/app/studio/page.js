"use client";
import FriendRequest from "@/components/home/friendRequest";
import Birthday from "@/components/home/birthday";
import OnlineFriends from "@/components/home/onlineFriends";
import ProfileSmallCard from "@/components/home/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import { useUser } from "@clerk/nextjs";
import Newfeed from "@/components/home/newfeed";

export const Studio = () => {
  const { user } = useUser();
  return (
    <div className="h-[120vh] w-screen flex items-start justify-center gap-4 py-4">
      {/* left */}
      <div className="hidden lg:block flex-col w-[25%]">
        <ProfileSmallCard user={user} />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-full flex-col lg:w-[50%] gap-5">
        <div className="flex flex-col gap-5 w-[100%] h-[150vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Newfeed user={user} />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Birthday />
        <OnlineFriends />
      </div>
    </div>
  );
};
export default Studio;
