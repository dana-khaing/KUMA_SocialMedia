"use server";
import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import Checkfriends from "@/components/userfriends/checkfriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import NotificationServer from "@/components/activity/notificationServer";

export const Activity = async () => {
  return (
    <div className="w-full min-h-screen flex items-start grow-0 justify-center gap-4 p-4">
      {/* left */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-full px-2 flex-col shrink-0 lg:w-[50%] gap-5">
        <Birthday />
        <NotificationServer />
      </div>
      {/* right */}
      <div className="hidden lg:flex flex-col grow-0 gap-5 w-[25%]">
        <FriendRequest />
        <Checkfriends />
      </div>
    </div>
  );
};

export default Activity;
