"use client";
import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import OnlineFriends from "@/components/userfriends/onlineFriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import { useUser } from "@clerk/nextjs";
import Checkfriends from "@/components/userfriends/checkfriends";

export const Friendlist = () => {
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
        <div className="flex flex-col gap-5 w-[100%] h-[125vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Birthday />
          <FriendRequest />
          <Checkfriends />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <OnlineFriends />
      </div>
    </div>
  );
};
export default Friendlist;
